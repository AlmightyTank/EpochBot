import json

with open('inputitems.json', 'r') as file:
    data = json.load(file)

output_data = {
    "items": []
}

for item_id, item_data in data.items():
    item = [item_id, item_data["name"], item_data["shortName"]]
    output_data["items"].append(item)

with open('items.json', 'w') as file:
    json.dump(output_data, file, indent=4)
