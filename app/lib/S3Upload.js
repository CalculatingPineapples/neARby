import AMAZON_S3 from '../config/AMAZON_S3_KEYS';
import { RNS3 } from 'react-native-aws3';

const options = {
  keyPrefix: 'uploads/',
  bucket: AMAZON_S3.bucket,
  region: AMAZON_S3.region,
  accessKey: AMAZON_S3.accessKey,
  secretKey: AMAZON_S3.secretKey,
  successActionStatus: 201
};

//this function returns a promise
const uploadImage = (uri, type, fileSize) => {
	let file = {
	  uri: 'file://' + uri,
	  name: '/' + type + '/' + fileSize + Math.floor(Math.random() * 10000) + '.jpg',
	  type: 'image/jpg'
	};

	return RNS3.put(file, options).then(response => {
		if (response.status !== 201) {
		  throw new Error('Failed to upload image to S3');
		}
		// console.log('response.status', response);
		return response.body.postResponse.location;
	})
	.catch(error => {
		console.log(error);
	});
};

export default uploadImage;