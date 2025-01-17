import requests
import json

# Define the URL and headers
url = "https://bsflll--meta-llama-3-8b-instruct-web.modal.run/"
headers = {"Content-Type": "application/json"}

# Define the payload
data = {
    "prompts": [
        """
        analyze this piece of data: 
        {"birdName": "Bird-1", "x": 78.342156, "y": -42.891023, "sightingTime": 1721305234.567890} 
        {"birdName": "Bird-1", "x": -23.567891, "y": 89.012345, "sightingTime": 1720987654.321098} 
        {"birdName": "Bird-1", "x": 56.789012, "y": -67.890123, "sightingTime": 1721123456.789012} 
        {"birdName": "Bird-1", "x": -90.123456, "y": 12.345678, "sightingTime": 1720765432.109876} 
        {"birdName": "Bird-1", "x": 34.567890, "y": 78.901234, "sightingTime": 1721234567.890123}
        """
    ]
}

# Make the POST request
response = requests.post(url, headers=headers, json=data)

# Pretty print the JSON response
print(json.dumps(response.json(), indent=2))
