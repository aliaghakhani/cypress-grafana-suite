pipeline {
    agent any
    
    environment {
        INFLUX_TOKEN = credentials('influxdb-token')
        INFLUX_URL   = 'http://localhost:8086' 
        INFLUX_ORG   = 'qa-automation' 
        INFLUX_BUCKET= 'cypress_metrics'
        ENV_NAME     = 'Local-Jenkins-Runner'
    }
    
    stages {
        stage('Pull SCM Source') {
            steps {
                checkout scm
            }
        }
        
        stage('Install System Modules') {
            steps {
                // Uses bat to safely run commands on Windows
                bat 'npm install'
            }
        }
        
        stage('Run Playground Suite') {
            steps {
                // Uses bat and Windows-safe logical checks
                bat 'npx cypress run --spec "cypress/e2e/playground.cy.js" --reporter json --reporter-options outputfile=cypress-results.json || exit 0'
            }
        }
        
        stage('Pipe Telemetry to Grafana') {
            steps {
                script {
                    if (fileExists('cypress-results.json')) {
                        
                        def parseScript = '''
                        const fs = require('fs');
                        try {
                            const raw = JSON.parse(fs.readFileSync('cypress-results.json', 'utf8'));
                            const stats = raw.stats || {};
                            const timestampNs = new Date().getTime() * 1000000;
                            
                            const lineData = `ui_playground,env=${process.env.ENV_NAME} total=${stats.tests || 0},passed=${stats.passes || 0},failed=${stats.failures || 0},duration_ms=${stats.duration || 0} ${timestampNs}`;
                            
                            fs.writeFileSync('influx-payload.txt', lineData);
                            console.log('Metrics structured.');
                        } catch (err) {
                            process.exit(1);
                        }
                        '''
                        
                        writeFile file: 'parseResults.js', text: parseScript
                        bat 'node parseResults.js'
                        
                        // Windows native curl escaping rules
                        bat """
                            curl -i -X POST "\${INFLUX_URL}/api/v2/write?org=\({INFLUX_ORG}&bucket=\){INFLUX_BUCKET}&precision=ns" ^
                            -H "Authorization: Token %INFLUX_TOKEN%" ^
                            -H "Content-Type: text/plain; charset=utf-8" ^
                            --data-binary @influx-payload.txt
                        """
                        
                        echo "Telemetry successfully synced!"
                    } else {
                        error "Execution logs missing."
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                cleanWs() 
            }
        }
    }
}