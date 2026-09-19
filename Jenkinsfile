pipeline {
    agent any
    
    environment {
        // Securely injects the Influx token from your Jenkins Credentials Manager
        INFLUX_TOKEN = credentials('influxdb-token')
        
        // Target parameters mapped directly to your local Docker network
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
                // Uses bat to safely run commands on Windows environments
                bat 'npm install'
            }
        }
        
        stage('Run Playground Suite') {
            steps {
                // Runs tests headlessly and bypasses termination faults via exit 0 check
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
                            console.log('Metrics successfully structured.');
                        } catch (err) {
                            process.exit(1);
                        }
                        '''
                        
                        writeFile file: 'parseResults.js', text: parseScript
                        bat 'node parseResults.js'
                        
                        // Clean environment parameters that prevent string interpolation failure
                        withEnv([
                            "URL=\${env.INFLUX_URL}",
                            "ORG=\${env.INFLUX_ORG}",
                            "BUCKET=\${env.INFLUX_BUCKET}"
                        ]) {
                            bat """
                                curl -i -X POST "%URL%/api/v2/write?org=%ORG%&bucket=%BUCKET%&precision=ns" ^
                                -H "Authorization: Token %INFLUX_TOKEN%" ^
                                -H "Content-Type: text/plain; charset=utf-8" ^
                                --data-binary @influx-payload.txt
                            """
                        }
                        
                        echo "Live metrics successfully synced to local dashboard engine!"
                    } else {
                        error "Telemetry step aborted: execution logs missing."
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
