-- InspireAI CRM — seed data
-- Run AFTER schema.sql and after creating your first user via the app
-- Replace YOUR_USER_ID with the UUID from auth.users

DO $$
DECLARE
  uid UUID := (SELECT id FROM auth.users LIMIT 1);
  c1 UUID; c2 UUID; c3 UUID; c4 UUID; c5 UUID;
  c6 UUID; c7 UUID; c8 UUID; c9 UUID; c10 UUID;
  comp1 UUID; comp2 UUID; comp3 UUID; comp4 UUID; comp5 UUID;
  comp6 UUID; comp7 UUID; comp8 UUID;
  d1 UUID; d2 UUID; d3 UUID; d4 UUID; d5 UUID;
BEGIN
  -- Companies
  INSERT INTO companies (name, industry, user_id) VALUES ('Northwind Labs','Technology',uid) RETURNING id INTO comp1;
  INSERT INTO companies (name, industry, user_id) VALUES ('Helio Robotics','Robotics',uid) RETURNING id INTO comp2;
  INSERT INTO companies (name, industry, user_id) VALUES ('Cobalt Freight','Logistics',uid) RETURNING id INTO comp3;
  INSERT INTO companies (name, industry, user_id) VALUES ('Meridian Health','Healthcare',uid) RETURNING id INTO comp4;
  INSERT INTO companies (name, industry, user_id) VALUES ('Aurora Retail','Retail',uid) RETURNING id INTO comp5;
  INSERT INTO companies (name, industry, user_id) VALUES ('Sentinel Bank','Finance',uid) RETURNING id INTO comp6;
  INSERT INTO companies (name, industry, user_id) VALUES ('Brightpath EDU','Education',uid) RETURNING id INTO comp7;
  INSERT INTO companies (name, industry, user_id) VALUES ('Vortex Mobility','Transportation',uid) RETURNING id INTO comp8;

  -- Contacts
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Marcus Webb','marcus@northwind.io','+1 415 555 0142','VP Engineering','customer',comp1,'AR','San Francisco, US',184000,uid) RETURNING id INTO c1;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Priya Nair','priya@helio.ai','+1 408 555 0117','Head of Data','prospect',comp2,'JT','Austin, US',96000,uid) RETURNING id INTO c2;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Tomás Herrera','tomas@cobaltfreight.com','+34 91 555 22 80','COO','lead',comp3,'AR','Madrid, ES',42000,uid) RETURNING id INTO c3;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Yuki Tanaka','yuki@meridian.health','+81 3 5555 0190','Director of AI','customer',comp4,'MS','Tokyo, JP',271000,uid) RETURNING id INTO c4;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Sofia Lindqvist','sofia@aurora.co','+46 8 555 0173','CTO','prospect',comp5,'JT','Stockholm, SE',128000,uid) RETURNING id INTO c5;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('James Carter','james@sentinel.bank','+44 20 5555 019','Head of Risk','customer',comp6,'MS','London, UK',332000,uid) RETURNING id INTO c6;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Elena Rossi','elena@brightpath.edu','+39 06 555 0144','Founder','prospect',comp7,'AR','Milan, IT',73000,uid) RETURNING id INTO c7;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Lukas Brandt','lukas@vortex.mobi','+49 30 5555 012','Chief Data Officer','prospect',comp8,'AR','Berlin, DE',152000,uid) RETURNING id INTO c8;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Amara Diallo','amara@kindred.media','+1 646 555 0166','VP Growth','lead',NULL,'JT','New York, US',36000,uid) RETURNING id INTO c9;
  INSERT INTO contacts (name,email,phone,role,type,company_id,owner,location,value,user_id)
    VALUES ('Grace Liu','grace@pinnacle.com','+1 213 555 0155','SVP Operations','customer',NULL,'JT','Los Angeles, US',119000,uid) RETURNING id INTO c10;

  -- Deals
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Platform license — Enterprise',c2,'negotiation',96000,'JT',uid) RETURNING id INTO d1;
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('AI Copilot rollout',c3,'lead',42000,'AR',uid) RETURNING id INTO d2;
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Vision QA pilot',c5,'proposal',128000,'JT',uid) RETURNING id INTO d3;
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Risk scoring engine',c6,'contract',332000,'MS',uid) RETURNING id INTO d4;
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Tutoring assistant MVP',c7,'proposal',73000,'AR',uid) RETURNING id INTO d5;
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Fleet routing optimization',c8,'negotiation',152000,'AR',uid);
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Content recommendation',c9,'lead',36000,'JT',uid);
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Demand forecasting expansion',c10,'won',119000,'JT',uid);
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Support deflection bot',c1,'contract',184000,'AR',uid);
  INSERT INTO deals (title,contact_id,stage,value,owner,user_id)
    VALUES ('Clinical summarization',c4,'negotiation',271000,'MS',uid);

  -- Activities
  INSERT INTO activities (type,text,contact_id,deal_id,owner,user_id)
    VALUES ('deal','Contract sent for Risk scoring engine',c6,d4,'MS',uid);
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('call','Discovery call completed',c2,'JT',uid);
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('email','Proposal follow-up emailed',c8,'AR',uid);
  INSERT INTO activities (type,text,contact_id,owner,scheduled_at,user_id)
    VALUES ('meeting','Stakeholder review scheduled',c4,'MS',NOW()+INTERVAL '1 day',uid);
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('note','Budget approved for Q3 pilot',c5,'JT',uid);

  -- Contact-specific timeline
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('call','Discovery call — discussed data pipeline pain points',c2,'JT',uid);
  INSERT INTO activities (type,text,contact_id,deal_id,owner,user_id)
    VALUES ('deal','Deal moved to Negotiation stage',c2,d1,'JT',uid);
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('email','Sent revised proposal with phased rollout pricing',c2,'JT',uid);
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('meeting','Technical deep-dive with engineering team',c2,'AR',uid);
  INSERT INTO activities (type,text,contact_id,owner,user_id)
    VALUES ('note','Champion identified — Head of Data is the primary advocate',c2,'JT',uid);

  -- Messages
  INSERT INTO messages (contact_id,subject,preview,body,unread,user_id)
    VALUES (c6,'Re: Risk scoring engine — contract','Thanks for the redlines. Legal has two small asks.',
      'Thanks for sending the redlines over. Our legal team reviewed overnight and we''re aligned on almost everything.'||chr(10)||chr(10)||
      'Two small asks before signature: a mutual liability cap at 12 months of fees, and a 30-day notice on the data-processing addendum.',
      true,uid);
  INSERT INTO messages (contact_id,subject,preview,body,unread,user_id)
    VALUES (c2,'Follow-up on discovery call','Great speaking today — sharing the architecture notes.',
      'Great speaking with you today. As promised, here are the architecture notes from the call and the two case studies we referenced.',
      true,uid);
  INSERT INTO messages (contact_id,subject,preview,body,unread,user_id)
    VALUES (c8,'Proposal questions','A couple of questions on the phased rollout pricing.',
      'Thanks for the proposal. A couple of questions before I take this to the steering committee.',
      true,uid);
  INSERT INTO messages (contact_id,subject,preview,body,unread,user_id)
    VALUES (c5,'Re: Q3 pilot budget','Good news — budget got approved on our end.',
      'Good news — budget got approved on our end for the Q3 pilot. Finance signed off this morning.',
      false,uid);
END $$;
