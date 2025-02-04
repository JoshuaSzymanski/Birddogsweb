from flask import Flask, render_template, request, send_from_directory, redirect, url_for, flash
import logging
import os
import subprocess
import time
import mysql.connector
from mysql.connector import Error

app = Flask(__name__, static_folder='public', static_url_path='')
app.secret_key = 'your_secret_key'  # Add a secret key for session management

# Set up logging
logging.basicConfig(level=logging.DEBUG)

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='birddogweb',
            user='root',
            password='HkTtPSS@12!#051132#'
        )
        if connection.is_connected():
            app.logger.debug('Connected to MySQL database')
            return connection
    except Error as e:
        app.logger.error(f'Error connecting to MySQL database: {e}')
        return None

@app.route('/')
def serve_home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/service1')
def service1():
    app.logger.debug('Rendering service1.html')
    return render_template('service1.html')

@app.route('/correspondent')
def correspondent():
    app.logger.debug('Rendering correspondent.html')
    return render_template('correspondent.html')

@app.route('/service3')
def service3():
    app.logger.debug('Rendering service3.html')
    return render_template('service3.html')

@app.route('/about')
def about():
    app.logger.debug('Rendering about.html')
    return render_template('about.html')

@app.route('/contact')
def contact():
    app.logger.debug('Rendering contact.html')
    return render_template('contact.html')

@app.route('/upload')
def upload():
    return render_template('upload-article.html')

@app.route('/insert_article', methods=['POST'])
def insert_article():
    try:
        title = request.form['title']
        summary = request.form['summary']
        content = request.form['content']
        image = request.files['image']

        if not title or not content:
            app.logger.error('Title or content missing')
            flash('Title or content missing', 'error')
            return redirect(url_for('upload'))

        # Save the image file
        image_filename = None
        if image:
            image_filename = os.path.join('uploads', image.filename)
            image.save(os.path.join(app.static_folder, image_filename))

        connection = get_db_connection()
        if connection is None:
            flash('Database connection failed', 'error')
            return redirect(url_for('upload'))

        cursor = connection.cursor()
        cursor.execute('INSERT INTO articles (title, summary, content, image) VALUES (%s, %s, %s, %s)', (title, summary, content, image_filename))
        connection.commit()
        cursor.close()
        connection.close()

        app.logger.debug(f'Article inserted: {title}')
        flash('Article inserted successfully', 'success')
        return redirect(url_for('upload'))
    except Exception as e:
        app.logger.error(f'Error inserting article: {e}', exc_info=True)
        flash('Failed to insert article', 'error')
        return redirect(url_for('upload'))

@app.errorhandler(404)
def page_not_found(e):
    app.logger.debug('Rendering 404.html')
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    app.logger.error(f'Server error: {request.url}')
    return render_template('500.html'), 500

if __name__ == "__main__":
    node_process = None
    gulp_process = None
    try:
        app.logger.debug('Starting the Flask app')
        os.environ['FLASK_ENV'] = 'development'
        app.logger.debug('FLASK_ENV set to development')

        # Create the directory 'C:\\Users\\joshu\\Birddogsweb\\src\\videos'
        os.makedirs(r'C:\Users\joshu\Birddogsweb\src\videos', exist_ok=True)
        app.logger.debug('Directory C:\\Users\\joshu\\Birddogsweb\\src\\videos created or already exists')

        # Start the Node.js server
        node_process = subprocess.Popen(['node', 'index.js'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        app.logger.debug('Node.js server started')

        # Wait for the server to start
        time.sleep(5)

        # Check if the server started successfully
        stdout, stderr = node_process.communicate()
        if stderr:
            app.logger.error(f"Error starting Node.js server: {stderr.decode()}")
            if "Port 3007 is already in use" in stderr.decode():
                app.logger.error("Port 3007 is already in use. Please free the port and try again.")
                raise SystemExit(1)
        else:
            app.logger.debug(f"Node.js server started successfully: {stdout.decode()}")

        # Start Gulp tasks
        gulp_path = subprocess.check_output(['where', 'gulp.cmd']).decode().strip()
        gulp_process = subprocess.Popen([gulp_path])
        app.logger.debug('Gulp tasks started')

        app.run(debug=True)

    except SystemExit as e:
        app.logger.debug(f'SystemExit occurred with code: {e.code}')
        if e.code != 0:
            app.logger.info(f'Flask app exited with code: {e.code}')
        else:
            app.logger.info('Flask app exited normally')
    except OSError as e:
        app.logger.error(f'OSError occurred: {e}', exc_info=True)
        raise
    except Exception as e:
        app.logger.error(f'Error starting the app: {e}', exc_info=True)
        raise
    finally:
        if node_process:
            node_process.terminate()
            app.logger.debug('Node.js server terminated')
        if gulp_process:
            gulp_process.terminate()
            app.logger.debug('Gulp tasks terminated')
