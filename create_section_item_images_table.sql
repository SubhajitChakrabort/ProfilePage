-- Create section_item_images table
CREATE TABLE IF NOT EXISTS section_item_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_item_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (section_item_id) REFERENCES section_items(id) ON DELETE CASCADE
);

-- Add index for better performance
CREATE INDEX idx_section_item_images_item_id ON section_item_images(section_item_id);
CREATE INDEX idx_section_item_images_display_order ON section_item_images(display_order); 