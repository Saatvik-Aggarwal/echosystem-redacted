import json
import datetime
import math
from collections import defaultdict
import pandas as pd
from sklearn.cluster import KMeans
from geopy.distance import great_circle
import requests
from waitress import serve

def handle_incoming_json(data):
    def read_custom_jsonl(json_in):
        # print(string_data)
        data = {
            "_creationTime": [],
            "birdName": [],
            "time": [],
            "x": [],
            "y": []
        }
        
        for entry in json_in:
            data["_creationTime"].append(float(entry["_creationTime"]))
            data["birdName"].append(entry["birdID"])
            data["time"].append(float(entry["sightingTime"]))
            data["x"].append(((float(entry["x"]) + 90) % 180) - 90)
            data["y"].append(((float(entry["y"]) + 180) % 360) - 180)


        return data

    # Usage
    data_points = read_custom_jsonl(data)
    print(data_points)
    # Convert to DataFrame for easier manipulation
    df = pd.DataFrame(data_points)
    print(df)
    # Extract month from timestamp
    df['time'] = pd.to_datetime(df['time'], unit='ms')
    df['month'] = df['time'].dt.month

    if len(df) == 0 or len(df['birdName'].unique()) == 0:
        return "N/A"

    bird = df['birdName'][0]

    # Group data by month
    monthly_data = dict(tuple(df.groupby('month')))

    text_instruction = ""

    for month, data in monthly_data.items():
        # Prepare feature set
        coordinates = data[['x', 'y']].values
        
        # Apply K-Means Clustering
        kmeans = KMeans(n_clusters=min(6, len(coordinates)), random_state=0)
        kmeans.fit(coordinates)
        labels = kmeans.labels_
        centers = kmeans.cluster_centers_
        
        # Assign cluster labels
        data['cluster'] = labels
        monthly_data[month] = data

    import re
    def get_country(lat, lon):
        # print("Lat:", lat, "Lon:", lon)
        url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={lon},{lat}&key=REDACTED'
        try:
            result = requests.get(url=url)
            result_json = result.json()
            # print("result_json:", result_json)
            formatted_addresses=[]
            for item in result_json['results']:
                formatted_addresses.append(item["formatted_address"])
            valid_addresses = [addr for addr in formatted_addresses if re.match(r'^[a-zA-Z]', addr)]
            if valid_addresses:
                longest_address = max(valid_addresses, key=len)
            else:
                longest_address = None
            return longest_address
        except Exception as e:
            return f"Error: {e}"

    for month, data in monthly_data.items():
        # text_instruction += f"\nMonth: {month}\n"
        for cluster_num in range(centers.shape[0]):
            cluster_data = data[data['cluster'] == cluster_num]
            center = centers[cluster_num]
            
            # Calculate distances to centroid
            distances = cluster_data.apply(
                lambda row: great_circle((row['x'], row['y']), (center[0], center[1])).meters, axis=1)
            
            # Define radius (e.g., within 1 standard deviation)
            radius = distances.std()
            
            # Number of points within radius
            points_within_radius = distances[distances <= radius].count()
            
            # Distribution statistics
            mean_distance = distances.mean()
            std_distance = distances.std()
            
            text_instruction += f"  Cluster {cluster_num + 1}:\n"
            location = get_country(center[0], center[1])
            text_instruction += f"    Center: {location}\n"
            text_instruction += f"    Points in Cluster: {len(cluster_data)}\n"
            # text_instruction += f"    Points within Radius ({radius:.2f} meters): {points_within_radius}\n"
            # text_instruction += f"    Mean Distance to Center: {mean_distance:.2f} meters\n"
            # text_instruction += f"    Standard Deviation of Distances: {std_distance:.2f} meters\n"

    # Combine all data
    all_data = pd.concat(monthly_data.values())

    # Overall statistics
    overall_mean_x = all_data['x'].mean()
    overall_mean_y = all_data['y'].mean()
    overall_std_x = all_data['x'].std()
    overall_std_y = all_data['y'].std()

    # text_instruction += "\nGeneral Distribution Parameters:\n"
    # text_instruction += f"  Mean Latitude (x): {overall_mean_x:.6f}\n"
    # text_instruction += f"  Mean Longitude (y): {overall_mean_y:.6f}\n"
    # text_instruction += f"  Standard Deviation Latitude (x): {overall_std_x:.6f}\n"
    # text_instruction += f"  Standard Deviation Longitude (y): {overall_std_y:.6f}\n"

    # At the end of the script, text_instruction will contain the whole output as a string.

    input = f"Here's the clustering and distribution of {bird}, on behalf of a biologist, be analytical and brief to analyze the data. Do not write as an assistant, write to fill an informational box in a report. Do not use markdown or any formatting or make any side comments. \n"

    print(input + '\n' + text_instruction)

    return input + '\n' + text_instruction


from flask import Flask, redirect, request, jsonify
from flask_cors import CORS, cross_origin
from waitress import serve

app = Flask(__name__)
cors = CORS(app, resources={r"/bird": {"origins": "*", "methods": ["POST", "OPTIONS"], "allow_headers": ["Content-Type"]}})
app.config['CORS_HEADERS'] = 'Content-Type'

# @app.before_request
# def before_request():
#     if request.method != 'OPTIONS' and not request.is_secure:
#         url = request.url.replace('http://', 'https://', 1)
#         return redirect(url, code=301)

@app.route('/bird', methods=['POST', 'OPTIONS'])
@cross_origin()
def receive_data():
    if request.method == 'OPTIONS':
        # Respond to preflight request
        response = jsonify({})
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    data = request.json
    # Process the received data here
    resp = jsonify({"message": "Data received successfully", "data": handle_incoming_json(data)}), 200
    return resp

if __name__ == '__main__':
    print("Starting server")
    serve(app, host='0.0.0.0', port=8080)