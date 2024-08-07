import { v2 as cloudinary } from 'cloudinary';
import uniqid from 'uniqid';

export async function POST(req) {
  const formData = await req.formData();

  if (formData.has('file')) {
    const file = formData.get('file');

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    const randomId = uniqid();
    const ext = file.name.split('.').pop();
    const newFilename = randomId + '.' + ext;

    const chunks = [];
    for await (const chunk of file.stream()) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    const uploadResult = await cloudinary.uploader.upload_stream(
      {
        public_id: newFilename,
        resource_type: 'auto',
        folder: 'your-folder-name', // Optional: specify a folder
      },
      (error, result) => {
        if (error) {
          throw new Error('Failed to upload to Cloudinary');
        }
        return result;
      }
    ).end(buffer);

    const link = uploadResult.secure_url;

    return Response.json(link);
  }
}
