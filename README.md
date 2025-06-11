# story-processing-service

This service enhances raw story uploads by:

- Merging media (image/video) with music using **FFmpeg**
- Uploading the final output to **Cloudinary**
- Emitting the final URL via **Kafka**

---