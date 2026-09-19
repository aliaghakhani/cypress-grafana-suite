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
                        
                        // Clean, isolated environment block that protects variables from compiler errors
                        withEnv([
                            "URL=\${INFLUX_URL}",
                            "ORG=\${INFLUX_ORG}",
                            "BUCKET=\${INFLUX_BUCKET}"
                        ]) {
                            bat """
                                curl -i -X POST "%URL%/api/v2/write?org=%ORG%&bucket=%BUCKET%&precision=ns" ^
                                -H "Authorization: Token %INFLUX_TOKEN%" ^
                                -H "Content-Type: text/plain; charset=utf-8" ^
                                --data-binary @influx-payload.txt
                            """
                        }
                        
                        echo "Telemetry successfully synced!"
                    } else {
                        error "Execution logs missing."
                    }
                }
            }
        }
