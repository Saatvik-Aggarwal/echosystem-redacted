import requests

BASE_URL = "https://optimistic-wombat-724.convex.site/api"


def check_and_create_species(bird_name):
    # Check if the species exists
    response = requests.get(f"{BASE_URL}/birdSpecies")
    species_list = response.json()

    for species in species_list:
        if species["birdName"] == bird_name:
            return species["_id"]

    # If species doesn't exist, create it
    new_species = {"birdName": bird_name}
    response = requests.post(f"{BASE_URL}/birdSpecies", json=new_species)
    if response.status_code == 201:
        return response.json()["_id"]
    else:
        raise Exception(f"Failed to create species: {response.text}")


def post_bird_data(bird_data):
    # Check and create species if needed
    species_id = check_and_create_species(bird_data["birdName"])

    # Prepare bird data for posting
    post_data = {
        "birdID": species_id,
        "x": bird_data["x"],
        "y": bird_data["y"],
        "sightingTime": bird_data["sightingTime"],
    }

    # Post bird data
    response = requests.post(f"{BASE_URL}/birdData", json=post_data)
    if response.status_code == 201:
        print("Bird data posted successfully")
        return response.json()
    else:
        raise Exception(f"Failed to post bird data: {response.text}")


# Example usage
# bird_data = {
#    "birdName": "American Robin",
#    "x": 42.3601,
#    "y": -71.0589,
#    "sightingTime": 1631234567890,
# }

# result = post_bird_data(bird_data)
# print(json.dumps(result, indent=2))
