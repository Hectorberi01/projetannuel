pipeline {
    agent any

    tools {
        nodejs '22.1.0'
    }

    environment {
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
                sh 'brew install pkg-config cairo pango libpng jpeg giflib librsvg'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Start Application') {
            steps {
                sh 'npm run start:dev'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished'
        }
        success {
            echo 'Pipeline succeeded'
        }
        failure {
            echo 'Pipeline failed'
        }
    }
}
