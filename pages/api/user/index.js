import nextConnect from 'next-connect';
import middleware from '../../../middlewares/middleware';
import { extractUser } from '../../../lib/api-helpers';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary'

const upload = multer({ dest: '/tmp' });
const handler = nextConnect();

const {
    hostname: cloud_name,
    username: api_key,
    password: api_secret,
} = new URL("cloudinary://199734791412289:1fNguLsGv3oAr7XY_s_OcVcT3AY@dpvocrenk");

cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
});

handler.use(middleware);
handler.get(async (req, res) => res.json({ user: extractUser(req) }));

handler.patch(upload.single('profilePicture'), async (req, res) => {
    if (!req.user) {
        req.status(401).end();
        return;
    }

    let profilePicture;
    if (req.file) {
        const image = await cloudinary.uploader.upload(req.file.path, {
            width: 1048,
            height: 1048,
            crop: 'fill',
            folder: 'Profile-Images',
            use_filename: true
        });
        profilePicture = image.secure_url;
    }

    const { name, bio } = req.body;

    await req.db.collection('users').updateOne(
        { _id: req.user._id },
        {
            $set: {
                name: name,
                bio: bio,
                ...(profilePicture && { profilePicture })
            },
        },
    );
    res.json({ user: { name, bio } });
});

export const config = {
    api: {
        bodyParser: false,
    },
};

export default handler;