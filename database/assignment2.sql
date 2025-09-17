INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
  ) VALUES ('Tony', 'Stark','tony@starkent.com', 'Iam1ronM@n');

UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

DELETE FROM public.account WHERE account_email = 'tony@starkent.com'; 

UPDATE
  public.inventory
SET inv_description = REPLACE (inv_description,'small interiors', 'huge interior')
WHERE inv_model = 'Hummer';

SELECT inv_make, inv_model, classification.classification_name
FROM inventory
JOIN classification
  ON inventory.classification_id = classification.classification_id
WHERE classification.classification_name = 'Sport';

UPDATE
  public.inventory
SET 
  inv_image = REPLACE (inv_image,'/images/vehicles/vehicles', '/images/vehicles/'),
  inv_thumbnail = REPLACE (inv_thumbnail,'/images/vehicles/vehicles', '/images/vehicles/');




