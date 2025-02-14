import Document from "../models/Document.js"; // Ensure the correct path to your Document model

const defaultData = "";

const getAllDocuments = async () => {
  try {
    const documents = await Document.find();
    return documents;
  } catch (error) {
    console.error("Error fetching documents:", error);
    throw error;
  }
};

const findOrCreateDocument = async ({ documentId, documentName }) => {
  if (!documentId) {
    throw new Error("Document ID is required");
  }
  
  try {
    let document = await Document.findById(documentId);
    if (document) {
      return document;
    }
    
    document = await Document.create({
      _id: documentId,
      name: documentName,
      data: defaultData,
    });
    return document;
  } catch (error) {
    console.error("Error finding or creating document:", error);
    throw error;
  }
};

const updateDocument = async (id, data) => {
  if (!id) {
    throw new Error("Document ID is required");
  }
  
  try {
    await Document.findByIdAndUpdate(id, data);
  } catch (error) {
    console.error("Error updating document:", error);
    throw error;
  }
};

export default { getAllDocuments, findOrCreateDocument, updateDocument };
