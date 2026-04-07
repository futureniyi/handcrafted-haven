# Image Upload API Documentation

## Overview
The image upload API allows sellers to upload product images to Vercel Blob storage. Images are validated and stored securely with unique filenames.

## Endpoint
- **POST** `/api/upload`
- **Authentication**: Required (Bearer token)
- **Role**: Seller only

## Request
Send a `multipart/form-data` POST request with:
- **Header**: `Authorization: Bearer <token>`
- **Body**: FormData with `file` field containing the image

### Allowed File Types
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/webp` (.webp)

### Constraints
- Maximum file size: 5MB
- Multiple files should be uploaded separately

## Response

### Success (200)
```json
{
  "url": "https://blob.vercel-storage.com/...",
  "size": 1024000,
  "type": "image/jpeg"
}
```

### Error Responses
- **400**: Invalid file type or size too large
- **401**: Missing or invalid authentication token
- **403**: User is not a seller
- **500**: Server error

## Example Usage (Frontend)

### JavaScript/React
```javascript
const uploadImage = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  return response.json(); // { url, size, type }
};
```

### Using with Product Creation
```javascript
// 1. Upload image(s)
const imageUrl = await uploadImage(file, token);

// 2. Create product with image URL
const productResponse = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Product Name',
    description: 'Description',
    price: 99.99,
    category: 'jewelry',
    images: [imageUrl.url] // Use URL from upload
  })
});
```

## Implementation Notes

### Local Development
- Vercel Blob requires `BLOB_READ_WRITE_TOKEN` environment variable
- Without the token, the API returns mock URLs for testing purposes
- To use real blob storage locally:
  1. Install Vercel CLI: `npm i -g vercel`
  2. Link project: `vercel link`
  3. Pull environment: `vercel env pull .env.local`
- Or manually set `BLOB_READ_WRITE_TOKEN` in your `.env.local`

### File Storage
- Images are stored in Vercel Blob with public access
- Filenames are auto-generated to prevent conflicts: `{userId}-{timestamp}-{random}-{originalName}`
- URLs are permanent and can be shared

### Security
- Authentication required
- Seller role verification
- File type validation
- File size validation
- User ID embedded in filename for audit trail
