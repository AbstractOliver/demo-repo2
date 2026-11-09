insert into workspaces (id, name, plan, invoice_counter) values
  ('ws_studio', 'Northlight Studio', 'team', 4),
  ('ws_bakery', 'Corner Bakery', 'starter', 1);

insert into users (id, email, name) values
  ('usr_maya', 'maya@acme.test', 'Maya Lind'),
  ('usr_omar', 'omar@acme.test', 'Omar Haddad'),
  ('usr_lena', 'lena@acme.test', 'Lena Berg'),
  ('usr_sam', 'sam@acme.test', 'Sam Okafor');

insert into members (workspace_id, user_id, role) values
  ('ws_studio', 'usr_maya', 'owner'),
  ('ws_studio', 'usr_omar', 'admin'),
  ('ws_studio', 'usr_lena', 'member'),
  ('ws_bakery', 'usr_sam', 'owner');

insert into customers (id, workspace_id, name, email, card_payment_method_id, card_last4) values
  ('cus_fjord', 'ws_studio', 'Fjord Outdoor', 'billing@fjord.test', 'pm_card_visa', '4242'),
  ('cus_pine', 'ws_studio', 'Pine & Co', 'accounts@pine.test', 'pm_card_mastercard', '4444'),
  ('cus_cafe', 'ws_bakery', 'Harbour Cafe', 'owner@harbour.test', null, null);

insert into invoices (id, workspace_id, customer_id, number, amount_cents, currency, status, due_date) values
  ('inv_1001', 'ws_studio', 'cus_fjord', 'NS-0001', 240000, 'EUR', 'paid', current_date - 40),
  ('inv_1002', 'ws_studio', 'cus_pine', 'NS-0002', 85000, 'EUR', 'open', current_date - 5),
  ('inv_1003', 'ws_studio', 'cus_fjord', 'NS-0003', 120000, 'EUR', 'open', current_date + 14),
  ('inv_1004', 'ws_studio', 'cus_pine', 'NS-0004', 43000, 'EUR', 'draft', current_date + 30),
  ('inv_2001', 'ws_bakery', 'cus_cafe', 'CB-0001', 12500, 'EUR', 'open', current_date + 7);
