import streamlit as st
from blockchain import Blockchain
import hashlib

# Initialize blockchain
if "blockchain" not in st.session_state:
    st.session_state.blockchain = Blockchain()

bc = st.session_state.blockchain

st.title("📄 Content Verification using Blockchain")

menu = ["Add Content", "Verify Content", "View Blockchain"]
choice = st.sidebar.selectbox("Menu", menu)

def get_file_hash(file):
    data = file.read()
    return hashlib.sha256(data).hexdigest()

def get_text_hash(text):
    return hashlib.sha256(text.encode()).hexdigest()

if choice == "Add Content":
    st.header("Add New Content")
    content_type = st.radio("Content Type", ["Text", "File (Image/Text)"])

    if content_type == "Text":
        text = st.text_area("Enter text/article here")
        if st.button("Add Text to Blockchain"):
            if text.strip():
                content_hash = get_text_hash(text)
                block = bc.add_block(content_hash)
                st.success(f"Text added to blockchain! Block index: {block.index}")
            else:
                st.error("Please enter some text.")

    elif content_type == "File (Image/Text)":
        uploaded_file = st.file_uploader("Upload a file", type=["txt", "png", "jpg", "jpeg"])
        if uploaded_file:
            if st.button("Add File to Blockchain"):
                content_hash = get_file_hash(uploaded_file)
                block = bc.add_block(content_hash)
                st.success(f"File added to blockchain! Block index: {block.index}")

elif choice == "Verify Content":
    st.header("Verify Content Authenticity")
    content_type = st.radio("Content Type", ["Text", "File (Image/Text)"])

    if content_type == "Text":
        text = st.text_area("Enter text/article here to verify")
        if st.button("Verify Text"):
            if text.strip():
                content_hash = get_text_hash(text)
                matches = [b for b in bc.chain if b.content_hash == content_hash]
                if matches:
                    st.success("✅ Content is Authentic!")
                else:
                    st.error("❌ Content has been Tampered or not added yet.")
            else:
                st.error("Please enter some text.")

    elif content_type == "File (Image/Text)":
        uploaded_file = st.file_uploader("Upload a file to verify", type=["txt", "png", "jpg", "jpeg"])
        if uploaded_file:
            if st.button("Verify File"):
                content_hash = get_file_hash(uploaded_file)
                matches = [b for b in bc.chain if b.content_hash == content_hash]
                if matches:
                    st.success("✅ Content is Authentic!")
                else:
                    st.error("❌ Content has been Tampered or not added yet.")

elif choice == "View Blockchain":
    st.header("Blockchain Data")
    chain_data = bc.get_chain_data()
    st.write(chain_data)
