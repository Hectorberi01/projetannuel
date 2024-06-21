pipeline {
    agent any

    environment {
        NODEJS_HOME = tool name: 'NodeJS 22.1.0', type: 'NodeJSInstallation'
        PATH = "${env.NODEJS_HOME}/bin:${env.PATH}"
    }

    stages {
        stage('Install Dependencies') {
            steps {
                script {
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    sh 'npm test'
                }
            }
        }

        stage('Build') {
            steps {
                script {
                    sh 'npm run build'
                }
            }
        }

        stage('Start Application') {
            steps {
                script {
                    sh 'npm run start:dev'
                }
            }
        }
    }
}
