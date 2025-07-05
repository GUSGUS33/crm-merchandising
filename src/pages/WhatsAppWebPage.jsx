import React, { useState, useEffect, useRef } from 'react'
import { whatsappService } from '../lib/whatsapp'
import { db } from '../lib/supabase'
import ConfiguracionWhatsAppModal from '../components/ConfiguracionWhatsAppModal'
import AsistenteCorreosModal from '../components/AsistenteCorreosModal'
import { 
  Search, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Mic, 
  Send,
  Phone,
  Video,
  Info,
  ArrowLeft,
  Download,
  Play,
  Pause,
  FileText,
  Image as ImageIcon,
  File,
  Settings,
  Volume2,
  PenTool
} from 'lucide-react'

const WhatsAppWebPage = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showAsistenteModal, setShowAsistenteModal] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.phone)
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = async () => {
    try {
      console.log('Cargando conversaciones...')
      
      // Solución alternativa: cargar datos directamente desde localStorage mock
      const mockClientes = JSON.parse(localStorage.getItem('crm_mock_clientes') || '[]')
      const mockLeads = JSON.parse(localStorage.getItem('crm_mock_leads') || '[]')
      
      console.log('Mock clientes cargados:', mockClientes.length)
      console.log('Mock leads cargados:', mockLeads.length)
      
      const allContacts = [
        ...mockClientes.map(c => ({ ...c, type: 'cliente', phone: c.telefono })),
        ...mockLeads.map(l => ({ ...l, type: 'lead', phone: l.telefono }))
      ].filter(contact => contact.phone) // Solo contactos con teléfono

      console.log('Contactos del CRM:', allContacts.length)

      // Cargar conversaciones adicionales de WhatsApp
      const whatsappMessages = JSON.parse(localStorage.getItem('whatsapp_messages') || '{}')
      console.log('Mensajes de WhatsApp encontrados:', Object.keys(whatsappMessages))
      
      const whatsappConversations = []
      
      Object.keys(whatsappMessages).forEach(phone => {
        const messages = whatsappMessages[phone]
        console.log(`Procesando teléfono ${phone}, mensajes:`, messages?.length || 0)
        
        if (messages && messages.length > 0) {
          // Verificar si ya existe en allContacts
          const existingContact = allContacts.find(c => c.phone === phone || c.telefono === phone)
          console.log(`¿Contacto existente para ${phone}?`, !!existingContact)
          
          if (!existingContact) {
            // Crear conversación desde el contexto del primer mensaje
            const firstMessage = messages[0]
            console.log('Primer mensaje:', firstMessage)
            
            if (firstMessage.context) {
              const newConversation = {
                id: firstMessage.context.clienteId || phone.replace(/\D/g, ''),
                nombre: firstMessage.context.nombreCliente || 'Contacto WhatsApp',
                empresa: firstMessage.context.empresa || '',
                email: '',
                telefono: phone,
                phone: phone,
                type: 'whatsapp',
                origen: 'whatsapp'
              }
              console.log('Nueva conversación creada:', newConversation)
              whatsappConversations.push(newConversation)
            }
          } else {
            console.log('Contacto ya existe en CRM, no se crea conversación adicional')
          }
        }
      })

      console.log('Conversaciones de WhatsApp creadas:', whatsappConversations.length)

      // Combinar todos los contactos
      const allConversations = [...allContacts, ...whatsappConversations]
      console.log('Total de conversaciones:', allConversations.length)

      // Obtener último mensaje de cada conversación
      const conversationsWithLastMessage = allConversations.map(contact => {
        const history = whatsappService.getMessageHistory(contact.phone || contact.telefono)
        const lastMessage = history[history.length - 1]
        
        console.log(`Historial para ${contact.phone || contact.telefono}:`, history.length, 'mensajes')
        
        return {
          ...contact,
          lastMessage: lastMessage?.message || 'Sin mensajes',
          lastMessageTime: lastMessage?.timestamp || Date.now(),
          unreadCount: 0, // TODO: Implementar conteo de no leídos
          isOnline: Math.random() > 0.7 // Simulación de estado online
        }
      })

      // Ordenar por último mensaje
      conversationsWithLastMessage.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
      
      console.log('Conversaciones finales:', conversationsWithLastMessage.length)
      setConversations(conversationsWithLastMessage)
    } catch (error) {
      console.error('Error cargando conversaciones:', error)
    }
  }

  const loadMessages = (phone) => {
    const history = whatsappService.getMessageHistory(phone)
    setMessages(history)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sendMessage = async () => {
    if (!newMessage.trim() && !selectedFile) return
    if (!selectedConversation) return

    try {
      if (selectedFile) {
        // Enviar archivo
        await sendFileMessage()
      } else {
        // Enviar mensaje de texto
        await whatsappService.sendTextMessage(
          selectedConversation.phone,
          newMessage,
          {
            type: 'manual_message',
            contactoId: selectedConversation.id,
            contactoTipo: selectedConversation.type,
            userId: 'current_user'
          }
        )
      }
      
      setNewMessage('')
      setSelectedFile(null)
      loadMessages(selectedConversation.phone)
      loadConversations() // Actualizar lista de conversaciones
    } catch (error) {
      console.error('Error enviando mensaje:', error)
    }
  }

  const sendFileMessage = async () => {
    if (!selectedFile || !selectedConversation) return

    const fileData = {
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      url: URL.createObjectURL(selectedFile) // En producción sería una URL real
    }

    await whatsappService.sendFileMessage(
      selectedConversation.phone,
      fileData,
      newMessage || `📎 ${selectedFile.name}`,
      {
        type: 'file_message',
        contactoId: selectedConversation.id,
        contactoTipo: selectedConversation.type,
        userId: 'current_user'
      }
    )
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatLastMessageTime = (timestamp) => {
    const now = new Date()
    const messageDate = new Date(timestamp)
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      return formatTime(timestamp)
    } else if (diffDays === 1) {
      return 'Ayer'
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString('es-ES', { weekday: 'short' })
    } else {
      return messageDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="w-6 h-6" />
    if (fileType.startsWith('audio/')) return <Volume2 className="w-6 h-6" />
    if (fileType.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />
    return <File className="w-6 h-6" />
  }

  const filteredConversations = conversations.filter(conv =>
    conv.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSaveConfig = async (config) => {
    try {
      // En producción, esto se guardaría en Supabase
      console.log('Configuración de WhatsApp guardada:', config);
      
      // Actualizar el servicio de WhatsApp con la nueva configuración
      whatsappService.updateConfig(config);
      
      // Recargar conversaciones con la nueva configuración
      await loadConversations();
      
      return true;
    } catch (error) {
      console.error('Error guardando configuración:', error);
      throw error;
    }
  }

  return (
    <div className="h-screen bg-gray-100 flex">
      {/* Panel izquierdo - Lista de conversaciones */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        {/* Header del panel izquierdo */}
        <div className="bg-gray-100 p-4 border-b border-gray-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">CRM</span>
              </div>
              <span className="font-medium text-gray-800">WhatsApp Business</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  console.log('✉️ Abriendo asistente de correos');
                  setShowAsistenteModal(true);
                }}
                className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                title="Asistente de Correos"
              >
                <PenTool className="w-5 h-5 text-blue-600" />
              </button>
              <button 
                onClick={() => {
                  console.log('🔧 Abriendo modal de configuración de WhatsApp');
                  setShowConfigModal(true);
                }}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                title="Configuración de WhatsApp"
                style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }} // Fondo rojo temporal para debug
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
          
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar o empezar un chat nuevo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Lista de conversaciones */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={`${conversation.type}-${conversation.id}`}
              onClick={() => setSelectedConversation(conversation)}
              className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedConversation?.id === conversation.id ? 'bg-gray-100' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                  <span className="text-gray-600 font-medium text-sm">
                    {conversation.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                {conversation.isOnline && (
                  <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Información de la conversación */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 truncate">
                    {conversation.nombre}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {formatLastMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
                
                {conversation.empresa && (
                  <p className="text-xs text-gray-400 truncate">
                    {conversation.empresa}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Panel derecho - Chat */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header del chat */}
            <div className="bg-gray-100 p-4 border-b border-gray-300 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {selectedConversation.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-medium text-gray-900">
                    {selectedConversation.nombre}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {selectedConversation.isOnline ? 'en línea' : `ult. vez hoy a las ${formatTime(Date.now())}`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Phone className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <Video className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Área de mensajes */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5ddd5' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundColor: '#e5ddd5'
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-md px-3 py-2 rounded-lg shadow-sm ${
                      message.direction === 'outbound'
                        ? 'bg-green-100 text-gray-900'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    {message.metadata?.fileData ? (
                      // Mensaje con archivo
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded border">
                          {getFileIcon(message.metadata.fileData.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {message.metadata.fileData.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(message.metadata.fileData.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button className="p-1 hover:bg-gray-200 rounded">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                        {message.message !== `📎 ${message.metadata.fileData.name}` && (
                          <p className="text-sm">{message.message}</p>
                        )}
                      </div>
                    ) : (
                      // Mensaje de texto normal
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                    )}
                    
                    <div className="flex items-center justify-end mt-1 space-x-1">
                      <span className="text-xs text-gray-500">
                        {formatTime(message.timestamp)}
                      </span>
                      {message.direction === 'outbound' && (
                        <div className="text-blue-500">
                          <svg width="16" height="15" viewBox="0 0 16 15" fill="currentColor">
                            <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l3.61 3.463c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.063-.51z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Área de entrada de mensaje */}
            <div className="bg-gray-100 p-4 border-t border-gray-300">
              {selectedFile && (
                <div className="mb-3 p-3 bg-white rounded-lg border flex items-center space-x-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <Smile className="w-5 h-5 text-gray-600" />
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-gray-200 rounded-full"
                >
                  <Paperclip className="w-5 h-5 text-gray-600" />
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Escribe un mensaje"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:border-green-500"
                  />
                </div>
                
                {newMessage.trim() || selectedFile ? (
                  <button 
                    onClick={sendMessage}
                    className="p-2 bg-green-500 hover:bg-green-600 rounded-full text-white"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onMouseDown={() => setIsRecording(true)}
                    onMouseUp={() => setIsRecording(false)}
                    className={`p-2 rounded-full ${isRecording ? 'bg-red-500' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  >
                    <Mic className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          // Estado sin conversación seleccionada
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-64 h-64 mx-auto mb-8 opacity-20">
                <svg viewBox="0 0 303 172" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M229.565 160.229c-6.429 6.429-16.858 6.429-23.287 0l-40.647-40.647c-3.429-3.429-8.571-3.429-12 0l-40.647 40.647c-6.429 6.429-16.858 6.429-23.287 0-6.429-6.429-6.429-16.858 0-23.287l40.647-40.647c3.429-3.429 3.429-8.571 0-12l-40.647-40.647c-6.429-6.429-6.429-16.858 0-23.287 6.429-6.429 16.858-6.429 23.287 0l40.647 40.647c3.429 3.429 8.571 3.429 12 0l40.647-40.647c6.429-6.429 16.858-6.429 23.287 0 6.429 6.429 6.429 16.858 0 23.287l-40.647 40.647c-3.429 3.429-3.429 8.571 0 12l40.647 40.647c6.429 6.429 6.429 16.858 0 23.287z" fill="#DADADA"/>
                </svg>
              </div>
              <h2 className="text-2xl font-light text-gray-600 mb-2">
                WhatsApp Web
              </h2>
              <p className="text-gray-500 max-w-md">
                Selecciona un chat para empezar a enviar mensajes a tus clientes y leads.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Configuración de WhatsApp */}
      <ConfiguracionWhatsAppModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSave={handleSaveConfig}
      />

      {/* Modal del Asistente de Correos */}
      <AsistenteCorreosModal
        isOpen={showAsistenteModal}
        onClose={() => setShowAsistenteModal(false)}
        preselectedContact={selectedConversation}
        contextType="whatsapp"
      />
    </div>
  )
}

export default WhatsAppWebPage

