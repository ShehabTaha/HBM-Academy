-- Add settings column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "isPublic": true,
  "isHidden": false,
  "tradeFileSource": false,
  "enableRatings": false,
  "enableDiscussions": false,
  "enableCertificates": false,
  "certificateValidityDays": null
}'::jsonb;
