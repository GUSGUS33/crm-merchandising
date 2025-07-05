-- Tabla de configuración de WhatsApp Business API
CREATE TABLE whatsapp_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  waba_id VARCHAR, -- ID de la cuenta de WhatsApp Business
  phone_number_id VARCHAR NOT NULL, -- ID del número de teléfono
  access_token TEXT NOT NULL, -- Token de acceso permanente
  webhook_url VARCHAR, -- URL del webhook
  webhook_verify_token VARCHAR, -- Token de verificación del webhook
  app_id VARCHAR, -- ID de la aplicación de Facebook
  app_secret VARCHAR, -- Secreto de la aplicación de Facebook
  is_active BOOLEAN DEFAULT true, -- Si esta configuración está activa
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES usuarios(id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_whatsapp_config_active ON whatsapp_config(is_active);
CREATE INDEX idx_whatsapp_config_phone_id ON whatsapp_config(phone_number_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar automáticamente updated_at
CREATE TRIGGER update_whatsapp_config_updated_at
    BEFORE UPDATE ON whatsapp_config
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_config_updated_at();

-- Insertar configuración por defecto (opcional)
INSERT INTO whatsapp_config (
  waba_id,
  phone_number_id,
  access_token,
  webhook_url,
  webhook_verify_token,
  app_id,
  app_secret,
  is_active
) VALUES (
  '', -- Dejar vacío para configurar después
  '', -- Dejar vacío para configurar después
  '', -- Dejar vacío para configurar después
  '', -- Se generará automáticamente
  '', -- Dejar vacío para configurar después
  '', -- Dejar vacío para configurar después
  '', -- Dejar vacío para configurar después
  false -- Inactivo hasta que se configure
) ON CONFLICT DO NOTHING;

