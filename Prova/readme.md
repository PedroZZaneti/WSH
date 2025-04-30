# Belle Croissant - Customer Management Dashboard

## How to Run the Project

###  Requirements

- Node.js installed (LTS version recommended)
- Visual Studio Code (optional but recommended)
- Global packages installed beforehand:
  
In any terminal execute the following command:
  npm install -g typescript ts-node json-server


## Running the Project

1- Open a terminal in the main folder and run:
json-server database.json --port 3000

2- In the backend folder, open another terminal and run:
npx ts-node src/dashboard-api.ts

3- Now everything that everything is running just open index.html or customers.html