import json

# Load the original JSON file
with open('inputammo.json', 'r') as f:
    original_data = json.load(f)

# Convert the original data to the desired format
new_data = {"ammo": []}
for key, value in original_data.items():
    new_data["ammo"].append([key, value["name"], value["shortName"]])

# Write the new data to a new JSON file
with open('ammo.json', 'w') as f:
    json.dump(new_data, f, indent=4)
