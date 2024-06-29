pipeline {
    agent any

    tools {
        nodejs '22.1.0'
    }

    environment {
        PATH = "/opt/homebrew/bin:$PATH"
        ACCESS_TOKEN_SECRET = credentials('ACCESS_TOKEN_SECRET')
        R2_ACCOUNT_ID = credentials('R2_ACCOUNT_ID')
        R2_ACCESS_KEY_ID = credentials('R2_ACCESS_KEY_ID')
        R2_SECRET_ACCESS_KEY = credentials('R2_SECRET_ACCESS_KEY')
        R2_BUCKET_NAME = credentials('R2_BUCKET_NAME')
        R2_BUCKET_PUBLIC_URL = credentials('R2_BUCKET_PUBLIC_URL')
        EMAIL_USER = credentials('EMAIL_USER')
        EMAIL_PASS = credentials('EMAIL_PASS')
        PAYPAL_CLIENT_ID = credentials('PAYPAL_CLIENT_ID')
        PAYPAL_CLIENT_SECRET = credentials('PAYPAL_CLIENT_SECRET')
        PAYPAL_MODE = 'sandbox'
        EMAIL_TEST = 'ethanfrancois0@gmail.com'
    }

    stages {
        stage('Install System Dependencies') {
            steps {
                sh '/opt/homebrew/bin/brew install pkg-config cairo pango libpng jpeg giflib librsvg'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Start Application') {
            steps {
                sh 'npm run start:dev &'
                sh 'sleep 10' // Attendre que l'application démarre
            }
        }

        stage('Check Application Status') {
            steps {
                script {
                    def response = sh(script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:4000", returnStdout: true).trim()
                    if (response != '200') {
                        error "Application did not start correctly. HTTP response code: ${response}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
            sh 'pkill -f "node" || true' // Arrêter l'application Node.js
        }
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
