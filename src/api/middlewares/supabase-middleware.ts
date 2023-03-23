import { RequestHandler } from 'express';
import { PLANS_BUCKET_NAME, supabase } from '../../database/supabase-client.js';
import log from '../../logger.js';

export const supabaseMiddleware: RequestHandler<
  unknown,
  unknown,
  unknown,
  unknown,
  { id: string; picture: string }
> = async (req, res, next) => {
  const { id } = res.locals;
  const fileBuffer = req.file?.buffer;
  let profilePicture;

  if (fileBuffer !== undefined) {
    const fileName = `ID:${id} DATE:${Date.now()}`;
    const { error } = await supabase.storage
      .from(PLANS_BUCKET_NAME)
      .upload(fileName, fileBuffer);

    if (error === null) {
      const { data } = supabase.storage
        .from(PLANS_BUCKET_NAME)
        .getPublicUrl(fileName);
      profilePicture = data.publicUrl;
      log.info('Public URL generated', data.publicUrl);

      res.locals.picture = profilePicture;
      log.info(res.locals.picture);
    }
  }

  next();
};
