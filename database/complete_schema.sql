-- Complete database schema for Joinery Project Manager
-- Run this in your Supabase SQL editor if starting fresh

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Projects table
CREATE TABLE projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_number VARCHAR(50) UNIQUE NOT NULL,
    client VARCHAR(255) NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    project_address TEXT,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    project_status VARCHAR(20) DEFAULT 'planning' CHECK (project_status IN ('planning', 'in_progress', 'completed', 'on_hold')),
    install_commencement_date DATE,
    install_duration INTEGER DEFAULT 0,
    overall_project_budget DECIMAL(10,2) DEFAULT 0,
    priority_level VARCHAR(10) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Installers table
CREATE TABLE installers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Joinery Items table
CREATE TABLE joinery_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_budget DECIMAL(10,2) DEFAULT 0,
    install_commencement_date DATE,
    install_duration INTEGER DEFAULT 0,
    shop_drawings_approved BOOLEAN DEFAULT FALSE,
    board_ordered BOOLEAN DEFAULT FALSE,
    hardware_ordered BOOLEAN DEFAULT FALSE,
    site_measured BOOLEAN DEFAULT FALSE,
    microvellum_ready_to_process BOOLEAN DEFAULT FALSE,
    processed_to_factory BOOLEAN DEFAULT FALSE,
    picked_up_from_factory BOOLEAN DEFAULT FALSE,
    install_scheduled BOOLEAN DEFAULT FALSE,
    plans_printed BOOLEAN DEFAULT FALSE,
    assembled BOOLEAN DEFAULT FALSE,
    delivered BOOLEAN DEFAULT FALSE,
    installed BOOLEAN DEFAULT FALSE,
    invoiced BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Project Tasks table
CREATE TABLE project_tasks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Materials table (with order tracking fields)
CREATE TABLE materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    material_name VARCHAR(255) NOT NULL,
    thickness DECIMAL(5,2),
    board_size VARCHAR(100),
    quantity INTEGER DEFAULT 0,
    supplier VARCHAR(255),
    is_ordered BOOLEAN DEFAULT FALSE,
    order_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Project Installers junction table
CREATE TABLE project_installers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    installer_id UUID REFERENCES installers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, installer_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(project_status);
CREATE INDEX idx_projects_install_date ON projects(install_commencement_date);
CREATE INDEX idx_joinery_items_project_id ON joinery_items(project_id);
CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX idx_materials_project_id ON materials(project_id);
CREATE INDEX idx_materials_is_ordered ON materials(is_ordered);
CREATE INDEX idx_project_installers_project_id ON project_installers(project_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_joinery_items_updated_at BEFORE UPDATE ON joinery_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_tasks_updated_at BEFORE UPDATE ON project_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_installers_updated_at BEFORE UPDATE ON installers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO installers (name, contact_info) VALUES 
('John Smith', 'john@example.com, 555-0123'),
('Mike Johnson', 'mike@example.com, 555-0124'),
('Sarah Wilson', 'sarah@example.com, 555-0125');

-- Insert sample project
INSERT INTO projects (project_number, client, project_name, project_address, project_status, install_commencement_date, install_duration, overall_project_budget, priority_level) VALUES 
('2024-001', 'ABC Construction', 'Kitchen Renovation', '123 Main St, City', 'in_progress', '2024-03-15', 5, 25000.00, 'high');
