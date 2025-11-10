# **Blockchain Content Verifier**

This is a full-stack application that demonstrates a simple, persistent, immutable blockchain. It consists of a Python/Flask backend that runs the blockchain logic and a React/Tailwind frontend that provides a polished, real-time user interface for interacting with it.

The application allows users to add new content, "mine" new blocks, and (most importantly) verify the integrity of content by checking its hash against the blockchain's immutable record.

## **Features**

### **Backend (Python & Flask)**

1. **Persistent Blockchain:** The chain state (blocks and pending data) is saved to chain_data.json upon any change, allowing the chain to persist between server restarts.
2. **Immutable Ledger:** A chain of blocks, each cryptographically linked to the one before it using SHA-256 hashes.
3. **Proof-of-Work:** A simple PoW algorithm (finding a hash starting with 0000) is required to "mine" new blocks and ensure security.
4. **RESTful API:** A clean Flask API for the frontend to consume, with endpoints for:

   * `GET /chain`: Fetch the entire blockchain and pending data.
   * `POST /add_content`: Add new data to the pending pool.
   * `GET /mine`: Run the proof-of-work and create a new block.
   * `POST /verify`: Check if a specific hash exists on the chain or in the pending pool.

5. **CORS Enabled:** Configured with flask-cors to allow requests from the React frontend.

### **Frontend (React & Tailwind)**

* **Polished Loading:** A custom-animated SVG infinity-loop loader provides a professional "splash screen" on initial load.
* **Staggered Animations:** The main app interface fades in element-by-element (`fadeInUp`) for a smooth, modern feel.
* **Robust Controls:** All interactive buttons (Add, Mine, Verify) enter a "busy" state (`isBusy`) during API calls, preventing double-clicks and providing clear user feedback.
* **Interactive UI:** Raw JSON block data is parsed into clean, readable `<BlockCard>` components, with interactive "Copy" buttons for hashes.
* **Seamless UX:** Users can instantly verify any hash (pending or mined) by clicking a "Verify" button next to it, which auto-fills the verification form and solves the manual copy-paste problem.
* **"Live" Data:** The app auto-refreshes by polling the `/chain` endpoint every 10 seconds, pulling in new pending data and mined blocks from other users.
* **Clean Feedback:** All status messages and verification results automatically fade away after 5 seconds, preventing UI clutter.

## **Tech Stack**

* **Backend:** Python 3, Flask, Flask-CORS
* **Frontend:** React (Vite), Tailwind CSS
* **Tooling:** Node.js & npm, Python pip & venv

## **Project Structure**

```
blockchain-verifier/
├── backend/
│   ├── app.py             # The Flask API server
│   ├── blockchain.py      # The core Blockchain class logic
│   ├── requirements.txt   # Backend dependencies
│   └── chain_data.json    # Persistent chain storage (auto-generated)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # The main React application component
│   │   ├── index.css      # Tailwind CSS imports & custom animations
│   │   └── main.jsx       # React entry point
│   ├── tailwind.config.js # Tailwind animation config
│   └── package.json       # Frontend dependencies
│
└── README.md              # This file
```

## **Setup & Installation**

This project requires Python 3 (with venv), Node.js, and npm. You will need to run two separate servers in two separate terminals.

### **1. Backend Setup**

First, set up and run the Python backend.
```
# 1. Navigate into the backend directory
cd backend

# 2. Create a Python virtual environment
python3 -m venv venv

# 3. Activate the virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# 4. Install the required Python packages
pip install -r requirements.txt
```

### **2. Frontend Setup**

In a **new terminal**, set up the React frontend.
```
# 1. Navigate into the frontend directory
cd frontend

# 2. Install the required npm packages
npm install
```

## **Running the Application**

### **Terminal 1: Run the Backend**

Make sure you are in the `backend` directory with your virtual environment activated.
```
# Start the Flask API server
# It will run on [http://127.0.0.1:5000](http://127.0.0.1:5000)
flask run
```

### **Terminal 2: Run the Frontend**

Make sure you are in the `frontend` directory.
```
# Start the Vite development server
# It will open on http://localhost:5173 (or a similar port)
npm run dev
```

### **3. Access the App**

Once both servers are running, open your browser and go to:

`http://localhost:5173`

You can now use the application. Try adding some content, mining a block, and verifying the new hashes!

## **API Endpoints (Backend)**

The Flask server provides the following endpoints:

* `GET /chain`
    * Retrieves the entire current blockchain and the list of pending data.
* `POST /add_content`
  * Adds a new content item to the pending data pool.
  * Body: `{ "content": "your data string", "metadata": {...} }`
* `GET /mine`
  * Runs the proof-of-work algorithm, creates a new block with all pending data, and adds it to the chain.
* `POST /verify`
  * Verifies if a piece of content exists on the chain.
  * Body: `{ "content_hash": "..." }`
  * Returns: A JSON object with verification status (`verified: true/false`, `pending: true/false`) and block details if found.