pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22.1.0'
    }

    stages {
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Start Application') {
            steps {
                sh 'npm run start:dev'
            }
        }
    }
}
