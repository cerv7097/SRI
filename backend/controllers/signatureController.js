// Upload signature
export const uploadSignature = async (req, res) => {
  try {
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ message: 'Signature data is required' });
    }

    // In a production environment, you might want to:
    // 1. Store the signature in cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Return a URL to the stored signature
    // For now, we'll just return the signature data URL

    res.status(200).json({
      message: 'Signature uploaded successfully',
      signatureUrl: signature,
    });
  } catch (error) {
    console.error('Error uploading signature:', error);
    res.status(500).json({
      message: 'Error uploading signature',
      error: error.message
    });
  }
};
