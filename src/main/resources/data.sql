-- =============================================
-- Seed Data — Users & Items (Schema: app)
-- =============================================

SET search_path TO app, public;

-- Users (Admin + 3 standard users)
-- Default passwords:
-- admin: admin123
-- user1, user2, user3: user123
INSERT INTO app.app_users (username, password, role) VALUES ('admin', '$2a$10$27r2pPCZtx6AWHYr9eJhbOOc3nZf2bu79fPLxVBvuxZSFpIUFVac2', 'ADMIN') ON CONFLICT (username) DO NOTHING;
INSERT INTO app.app_users (username, password, role) VALUES ('user1', '$2a$10$eRrxWbx7lnWGzPFo63VXxuTIDm.zzIeK0vRMSE.TI2.yHTvC2RYgO', 'USER')  ON CONFLICT (username) DO NOTHING;
INSERT INTO app.app_users (username, password, role) VALUES ('user2', '$2a$10$eRrxWbx7lnWGzPFo63VXxuTIDm.zzIeK0vRMSE.TI2.yHTvC2RYgO', 'USER')  ON CONFLICT (username) DO NOTHING;
INSERT INTO app.app_users (username, password, role) VALUES ('user3', '$2a$10$eRrxWbx7lnWGzPFo63VXxuTIDm.zzIeK0vRMSE.TI2.yHTvC2RYgO', 'USER')  ON CONFLICT (username) DO NOTHING;

-- Tradeable Items
INSERT INTO app.items (name, unit) VALUES ('Rice',  'KG')    ON CONFLICT (name) DO NOTHING;
INSERT INTO app.items (name, unit) VALUES ('Wheat', 'KG')    ON CONFLICT (name) DO NOTHING;
INSERT INTO app.items (name, unit) VALUES ('Paddy', 'KG')    ON CONFLICT (name) DO NOTHING;
INSERT INTO app.items (name, unit) VALUES ('Dal',   'KG')    ON CONFLICT (name) DO NOTHING;
INSERT INTO app.items (name, unit) VALUES ('Chana', 'KG')    ON CONFLICT (name) DO NOTHING;
