# app.py: This module contains the Flask application for TimeEntryDE2.

from datetime import datetime
import os
import secrets
import uuid
import base64
import hashlib

from azure.cosmosdb.table.tableservice import TableService

from flask_cors import CORS
from flask import request, jsonify
from flask import Flask, session, send_from_directory

def generate_qrcode_string(username, password):
    # Concatenate username and password and hash it using SHA256
    hash_object = hashlib.sha256((username + password).encode())
    hex_dig = hash_object.hexdigest()

    # Encode the hash using Base64 to get a string
    b64_string = base64.b64encode(hex_dig.encode()).decode()

    # Truncate or pad the string to make it 30 characters long
    qrcode_string = (b64_string[:30] + '==' * ((30 - len(b64_string)) // 2))[:30]

    return qrcode_string


# Remove the unused import of current_app
# from flask import current_app

mydebug = True


def mydebug_print(*args):
    if mydebug:
        print(*args)
    return


# Create the Flask application
# for React static files
app = Flask(__name__, static_folder='timereactr/build', static_url_path='')


# Enable Cross-Origin Resource Sharing
# Enable CORS for all routes with origins allowed
CORS(app, resources={r"/*": {"origins": "*"}})

# Generate a secure random string of 32 bytes
secret_key = secrets.token_hex(32)

# Set the secret key for the session
app.secret_key = secret_key

# timeentrytables
# Read the secret TIMEENTRYTABLES from the repository secrets
account_name = 'TIMEENTRYTABLES'
# read the secret environment variable
# account_key = os.environ.get('TIMEENTRYTABLES')
# if not account_key:
#    raise ValueError("TIMEENTRYTABLES environment variable not set")

connection_string = os.environ.get('TIMEENTRYTABLES_CONNECTION')
if not connection_string:
    raise ValueError("TIMEENTRYTABLES_CONNECTION environment variable not set")


for key, value in os.environ.items():
    print(f"{key}: {value}")

# connect to the table service using connection string
# table_service = TableService(account_name=account_name, account_key=account_key)
table_service = TableService(connection_string=connection_string)


def generate_row_key():
    # Generate a unique row key for the table.
    # Returns:
    #     A unique row key.
    return str(uuid.uuid4())


def is_user_available_azure_tables(username, hashed_password, table_service):
    filter_str = f"RowKey eq '{username}'"
    try:
        entities = table_service.query_entities('users', filter=filter_str)
        for entity in entities:
            if entity.password == hashed_password:
                return True  # Hashed password matches
        # Debug print both passwords
        mydebug_print("is_user_available_azure_tables: hashed_password: ",
                      hashed_password, "entity.password: ", entity.password)
        return False  # No matching hashed password found
    except Exception as e:
        # Handle exceptions, such as connection errors
        print(f"Error querying Azure Table Storage: {e}")
        return False


def insert_config(user_id, start_date, end_date, hours_per_week, comment, table_service):
    # Generate a RowKey
    rowkey = generate_row_key()  # Replace with your RowKey generation logic

    entity = {
        'PartitionKey': user_id,
        'RowKey': rowkey,
        'StartDate': start_date,
        'EndDate': end_date,
        'HoursPerWeek': hours_per_week,
        'Comment': comment
    }

    table_service.insert_entity('ConfigTable', entity)
    return rowkey


def insert_user(username, hashed_password, table_service):
    try:
        # create a new entity with the user's data
        user_entity = {
            'PartitionKey': 'partition1',
            'RowKey': username,
            'password': hashed_password
        }

        # insert the entity into the table
        table_service.insert_entity('users', user_entity)
    except Exception as e:
        mydebug_print("insert_user: error: ", e)
        return jsonify({'error': str(e)}), 500


def return_config(username, table_service):
    # Query the table for the username and password

    filter = f"PartitionKey eq '{username}'"

    mydebug_print("return_config: filter: ", filter)

    try:
        entities = table_service.query_entities('ConfigTable', filter=filter)
    except Exception as e:
        print("Error querying Azure Table")
        print(e)

    # If the entities is available, return True
    if entities:
        return entities

    # If the username is not available, return False
    return False


def return_times(username, table_service):
    # Query the table for the username and password
    filter = f"username eq '{username}'"

    entities = table_service.query_entities('times', filter=filter)

    # If the username is available, return True
    if entities:
        return entities

    # If the username is not available, return False
    return False


# -------------------------------------------------------------
# Routing
#
#
# -------------------------------------------------------------


@app.route('/api/login', methods=['POST'])
def login():
    username = None
    if request.json:
        username = request.json.get('username')
        password = request.json.get('password')
    else:
        username = None
        password = ''

    # create a sha256 hash of the password
    hashed_password = hashlib.sha256(password.encode()).hexdigest()
    user = None
    user = is_user_available_azure_tables(
        username, hashed_password, table_service)

    mydebug_print("login: username: ", username,
                  "hashed_password: ", hashed_password, "user: ", user)

    if user:
        session['user_id'] = username
        session['active_user_id'] = username
        entities = list(table_service.query_entities(
            'users', filter=f"RowKey eq '{username}'"))  # Convert entities to a list
        session['qrcode'] = entities[0].qrcode if entities else None
        mydebug_print("login: session['user_id']: ", session['user_id'], "session['active_user_id']: ",
                      session['active_user_id'], "session['qrcode']: ", session['qrcode'])
        return jsonify({'message': 'Login successful'}), 200

    return jsonify({'message': 'Invalid username or password'}), 401

@app.route('/user_login/<qrcode>', methods=['GET'])
def user_login(qrcode):
    # query the users table for the qrcode
    filter_str = f"qrcode eq '{qrcode}'"
    entities = table_service.query_entities('users', filter=filter_str)
    for entity in entities:
        if entity.qrcode == qrcode:
            session['user_id'] = entity.RowKey
            session['active_user_id'] = entity.RowKey
            session['qrcode'] = entity.qrcode
            mydebug_print("user_login: entity.RowKey: ", entity.RowKey)
            return jsonify({'message': 'Login successful'}), 200
    return jsonify({'message': 'Invalid QR code'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    try:
        username = None
        password = None
        if request.json:
            username = request.json.get('username')
            password = request.json.get('password')

        # create a sha256 hash of the password
        if password is not None:
            hashed_password = hashlib.sha256(password.encode()).hexdigest()
        else:
            hashed_password = None

        mydebug_print("register: username: ", username,
                      "hashed_password: ", hashed_password)

        # Here insert your logic to register the user
        insert_user(username, hashed_password, table_service)


        # Generate the QR code string and update the user entity with the QR code string
        qrcode_string = generate_qrcode_string(username, password)
        user_entity = {
            'PartitionKey': 'partition1',
            'RowKey': username,
            'password': hashed_password,
            'qrcode': qrcode_string
        }
        table_service.update_entity('users', user_entity)


        # on registering always add permission to the user itself to the permission table
        permission_entity = {
            'PartitionKey': username,
            'RowKey': generate_row_key(),
            'allowed_user': username
        }
        table_service.insert_entity('permissions', permission_entity)

        mydebug_print("register: permission_entity: ", permission_entity)
        return jsonify({'message': 'Registration successful'}), 201

    except Exception as e:
        mydebug_print("register: error: ", e)
        return jsonify({'message': 'Registration failed', 'error': str(e)}), 500

@app.route('/api/qrcode', methods=['GET'])
def get_qrcode():
    # Get the QR code string from the session
    qrcode = session.get('qrcode')
    mydebug_print("get_qrcode: qrcode: ", qrcode)
    if qrcode:
        return jsonify({'qrcode': qrcode}), 200
    else:
        return jsonify({'message': 'No QR code available'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('active_user_id', None)
    return jsonify({'message': 'Logout successful'}), 200


@app.route('/api/home')
def home():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    mydebug_print("home: user_id: ", user_id)
    # Here fetch and return the data needed for the home view
    # records = get_user_records(user_id, table_service)
    # return jsonify(records)
    return jsonify({'message': 'Welcome to the home page!'})


@app.route('/retrieve_react', methods=['GET'])
def retrieve_data():
    # Retrieve data from the database.

    # Returns:
    #     The retrieved data as a JSON object.

    user_id = session.get('active_user_id')
    rows = return_times(user_id, table_service)

    mydebug_print("retrieve data: rows: ", rows, "user_id: ", user_id)

    # Convert rows to dict
    data = []
    if isinstance(rows, bool):
        pass
    else:
        for row in rows:
            data.append({
                "id": row.RowKey,
                "date": row.date,
                "hours": row.hours,
                "comment": row.comment,
                "type": getattr(row, 'type', ""),  # Use getattr to avoid error if 'type' doesn't exist
                "username": row.username
            })

    return jsonify(data)


@app.route('/config/add', methods=['POST'])
def add_configuration():
    user_id = session.get('active_user_id')

    if not user_id:
        mydebug_print("add_configuration: No user_id in session")
        return jsonify({'error': 'User not logged in or session expired'}), 401

    data = request.json
    start_date, end_date, hours_per_week, comment = data[
        'startDate'], data['endDate'], data['hoursperweek'], data['comment']
    mydebug_print("add config: user_id:", user_id, "start_date:", start_date,
                  "end_date:", end_date, "hours_per_week:", hours_per_week, "comment:", comment)

    # Get all configurations
    configurations = list(return_config(user_id, table_service))
    # print number of entries in the list
    

    if len(configurations) > 0:
        # Sort configurations by start date in descending order
        sorted_configurations = sorted(configurations, key=lambda x: datetime.strptime(x.StartDate, '%Y-%m-%d'), reverse=True)

        # Check if the current configuration is the last one
        if datetime.strptime(start_date, '%Y-%m-%d') >= datetime.strptime(sorted_configurations[0].StartDate, '%Y-%m-%d'):
            # Set the end date to '9999-12-31'
            mydebug_print("add_configuration: Setting end date to '9999-12-31'")
            end_date = '9999-12-31'
    else:
        # Set the end date to '9999-12-31' if this is the first configuration
        end_date = '9999-12-31'

    try:
        rowkey = insert_config(user_id, start_date, end_date,
                               hours_per_week, comment, table_service)
        data['id'] = rowkey
        return jsonify(success=True, row=data), 201
    except Exception as e:
        mydebug_print("Error inserting into Azure Table:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/add_row', methods=['POST'])
def add_row():
    mydebug_print("add_row: request: ", request, " ", request.json)
    username = session.get('active_user_id')
    if not username:
        return jsonify({'error': 'User not logged in or session expired'}), 401

    data = request.json
    data['username'] = username  # Add the username to the data dictionary
    data['date'] = data.get('date').format("YYYY-MM-DD") if 'date' in data else None

    try:
        # Generate a unique row key
        rowkey_id = generate_row_key()
        time_entity = {
            'PartitionKey': 'partition1',
            'RowKey': str(rowkey_id),
            'username': username,
            'date': data['date'],
            'hours': data['hours'],
            'comment': data['comment'],
            'type': data['entryType']
        }
        table_service.insert_entity('times', time_entity)
        return jsonify({'message': 'Time entry added successfully', 'row': time_entity}), 201
    except Exception as e:
        mydebug_print("Error inserting into Azure Table:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/update_row', methods=['POST'])
def update_row():
    mydebug_print("update_row: request: ", request)
    username = session.get('active_user_id')
    if not username:
        return jsonify({'error': 'User not logged in or session expired'}), 401

    data = request.json
    data['username'] = username  # Add the username to the data dictionary
    data['date'] = data.get('date').format("YYYY-MM-DD") if 'date' in data else None

    try:
        # Ensure the record ID is present
        if 'id' not in data:
            return jsonify({'error': 'Record ID is required'}), 400

        # Create the entity with the updated data
        time_entity = {
            'PartitionKey': 'partition1',
            'RowKey': data['id'],
            'username': username,
            'date': data['date'],
            'hours': data['hours'],
            'comment': data['comment'],
            'type': data['type']
        }
        table_service.update_entity('times', time_entity)
        return jsonify({'message': 'Time entry updated successfully', 'row': time_entity}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/delete_row', methods=['POST'])
def delete_row():
    data = request.json
    # Assuming the table columns are ID, Date, Hours, Comment, Username
    record_id = data['id']
    table_service.delete_entity('times', 'partition1', str(record_id))

    return jsonify(success=True)


@app.route('/admin/retrieve', methods=['GET'])
def retrieve_admin_data():

    mydebug_print("retrieve_admin_data: request: ", request)

    # Retrieve times and ConfigTable data from Database
    user_id = session.get('active_user_id')

    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    times_rows = return_times(user_id, table_service)
    config_rows = return_config(user_id, table_service)

    mydebug_print("retrieve_admin_data: times_rows: ",
                  times_rows, "config_rows: ", config_rows)

    data = []
    for times_row in times_rows:
        # t_date = times_row['date'].strftime('%Y-%m-%d')

        print("times_row: ", datetime.strptime(times_row['date'], '%Y-%m-%d'))
        print("times_row: ", datetime.strptime(
            times_row['date'], '%Y-%m-%d').date())

        times_date = datetime.strptime(times_row['date'], '%Y-%m-%d').date()
        for config_row in config_rows:
            config_start_date = datetime.strptime(
                config_row.StartDate, '%Y-%m-%d').date()
            config_end_date = datetime.strptime(
                config_row.EndDate, '%Y-%m-%d').date()
            mydebug_print("retrieve_admin_data: times_date: ", times_date,
                          "config_start_date: ", config_start_date, "config_end_date: ", config_end_date)
            if config_start_date <= times_date <= config_end_date:
                expected_work_hours = float(
                    (times_date - config_start_date).days) * float(config_row.HoursPerWeek) / 7
                actual_work_hours = 0
                for row in times_rows:
                    row_date = datetime.strptime(
                        row['date'], '%Y-%m-%d').date()
                    if row_date <= times_date:
                        actual_work_hours += float(row['hours'])
                data.append({
                    'date': times_date.strftime('%Y-%m-%d'),
                    'ToBeHours': '{:.2f}'.format(round(expected_work_hours, 2)),
                    'AsIsHours': '{:.2f}'.format(round(actual_work_hours, 2)),
                    'overtime': '{:.2f}'.format(round(actual_work_hours - expected_work_hours, 2))
                })
        # sort data descending according to date column
        # data.sort(key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'), reverse=True)
        mydebug_print("retrieve_admin_data: data: ", data)
        # initialize empty sorted_data
        sorted_data = []

        sorted_data = sorted(data, key=lambda x: datetime.strptime(
            x['date'], '%Y-%m-%d'), reverse=True)
        mydebug_print("retrieve_admin_data: sorted_data: ", sorted_data)

    return jsonify(sorted_data)



@app.route('/config/update', methods=['POST'])
def update_configuration():
    user_id = session.get('active_user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    data = request.json
    if 'id' not in data:
        return jsonify({'message': 'Configuration ID is required'}), 400

    mydebug_print("update_configuration: data: ", data)
    row_key = data['id']
    start_date = data['startDate']
    end_date = data['endDate']
    hours_per_week = data['hoursperweek']
    comment = data['comment']

    # Get all configurations
    configurations = return_config(user_id, table_service)

    # Sort configurations by start date in descending order
    sorted_configurations = sorted(configurations, key=lambda x: datetime.strptime(x.StartDate, '%Y-%m-%d'), reverse=True)

    # Check if the current configuration is the last one
    if datetime.strptime(start_date, '%Y-%m-%d') >= datetime.strptime(sorted_configurations[0].StartDate, '%Y-%m-%d'):
        # Set the end date to '9999-12-31'
        mydebug_print("update_configuration: Setting end date to '9999-12-31'")
        end_date = '9999-12-31'

    config_data = {
        'PartitionKey': user_id,
        'RowKey': row_key,
        'StartDate': start_date,
        'EndDate': end_date,
        'HoursPerWeek': hours_per_week,
        'Comment': comment
    }

    table_service.update_entity('ConfigTable', config_data)
    return jsonify(success=True)

@app.route('/config/retrieve', methods=['GET'])
def retrieve_configuration():
    user_id = session.get('active_user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    rows = return_config(user_id, table_service)

    # Convert rows to dict
    data = []
    if isinstance(rows, bool):
        pass
    else:
        for row in rows:
            data.append({
                "id": row.RowKey,
                "startDate": row.StartDate,
                "endDate": row.EndDate,
                "hoursperweek": row.HoursPerWeek,
                "comment": row.Comment
            })

    return jsonify(data)

@app.route('/config/delete', methods=['POST'])
def delete_configuration():
    user_id = session.get('active_user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    data = request.json
    if 'id' not in data:
        return jsonify({'message': 'Configuration ID is required'}), 400

    try:
        config_id = data['id']
        table_service.delete_entity('ConfigTable', user_id, config_id)
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/add_permission', methods=['POST'])
def add_permission():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    user_id = session.get('active_user_id')
    data = request.json
    allowed_user = data.get('allowed_user')

    if allowed_user == user_id:
        return jsonify({'message': 'Cannot add permission to self'}), 400

    # Check if the permission already exists
    filter_str = f"PartitionKey eq '{user_id}' and allowed_user eq '{allowed_user}'"
    existing_permissions = table_service.query_entities(
        'permissions', filter=filter_str)
    if list(existing_permissions):
        return jsonify({'message': 'Permission already exists'}), 409

    # Create a unique RowKey for the new permission
    rowkey = generate_row_key()  # Ensure this generates a unique key

    permission_entity = {
        'PartitionKey': user_id,
        'RowKey': rowkey,
        'allowed_user': allowed_user
    }

    try:
        table_service.insert_entity('permissions', permission_entity)
        mydebug_print("add_permission: permission_entity: ", permission_entity)
        return jsonify({'message': 'Permission added successfully'}), 201
    except Exception as e:
        print("Error adding permission:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_permissions', methods=['GET'])
def get_permissions():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    user_id = session.get('active_user_id')

    filter_str = f"PartitionKey eq '{user_id}'"
    permissions = table_service.query_entities(
        'permissions', filter=filter_str)
    # allowed_users = [permission.allowed_user for permission in permissions if permission.allowed_user != user_id]
    # from permissions, get all user records that are stored in PartitionKey
    permission_users = []
    for permission in permissions:
        permission_user = permission.allowed_user
        permission_users.append(permission_user)
    mydebug_print("get_permissions: permission_users: ", permission_users)
    return jsonify({'permissions': permission_users})


@app.route('/api/current_user', methods=['GET'])
def get_current_user():
    user_id = session.get('active_user_id')
    qrcode = session.get('qrcode')
    mydebug_print("get_current_user: user_id: ", user_id)
    if user_id:
        return jsonify({'user_id': user_id, 'qrcode': qrcode}), 200
    else:
        return jsonify({'message': 'No user logged in'}), 401

# New endpoint to get active users
@app.route('/api/get_active_users', methods=['GET'])
def get_active_users():
    # here the user_id because this is stored in the database
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    mydebug_print("get_active_users for: user_id: ", user_id)

    # Query permissions table for users accessible by the logged-in user
    filter_str = f"allowed_user eq '{user_id}'"
    permissions = table_service.query_entities(
        'permissions', filter=filter_str)
    # get all entries of column allowed_user
    users = [permission.PartitionKey for permission in permissions]
    mydebug_print("get_active_users: users: ", users)
    return jsonify({'activeUsers': users})

# New endpoint to set active user


@app.route('/api/set_active_user', methods=['POST'])
def set_active_user():
    data = request.json

    active_user_id = data.get('activeUserId')
    session['active_user_id'] = active_user_id
    return jsonify({'message': 'Active user updated'}), 200


@app.route('/api/remove_permission', methods=['POST'])
def remove_permission():
    data = request.json
    user_id = session.get('user_id')
    allowed_user = data.get('allowed_user')

    # Check if the user is logged in
    if not user_id:
        return jsonify({'message': 'Not logged in'}), 401

    # Remove permission entry
    try:
        # delete the user_id allowed_user from the permissions table
        filter_str = f"PartitionKey eq '{user_id}' and allowed_user eq '{allowed_user}'"
        entities = table_service.query_entities(
            'permissions', filter=filter_str)
        entities_list = list(entities)
        if not entities_list:
            return jsonify({'message': 'Permission does not exist'}), 404
        user_entity = entities_list[0]
        user_rowkey = user_entity.get('RowKey')
        table_service.delete_entity('permissions', user_id, user_rowkey)
        return jsonify({'message': 'Permission removed successfully'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# for other react routes
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def default_path(path):
    mydebug_print("index: path: ", path)
    try:
        if path != "" and os.path.exists("../timeentryde3rn/build" + path):
            return send_from_directory("../timeentryde3rn/build/", path)
        return send_from_directory("../timeentryde3rn/build/", 'index.html')
    except Exception as e:
        mydebug_print("index: error: ", e)
        return send_from_directory("../timeentryde3rn/build/", 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=80)
