import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Alert,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Send,
  Group,
  Person,
  Delete,
  MoreVert,
  Inbox,
  Send as SentIcon,
  Refresh,
  Clear,
  Work
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import io from 'socket.io-client';

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [isGroupMessage, setIsGroupMessage] = useState(true);
  const [socket, setSocket] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentBox, setCurrentBox] = useState('inbox');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchMessages();
    fetchTeamMembers();
    
    // Socket.io connection disabled for production deployment
    // Initialize socket connection
    // const newSocket = io('http://localhost:5000');
    // setSocket(newSocket);

    // newSocket.emit('join-room', user.teamId);

    // newSocket.on('new-message', (message) => {
    //   if (currentBox === 'inbox') {
    //     setMessages(prev => [message, ...prev]);
    //   }
    // });

    // return () => newSocket.close();
  }, [user.teamId, currentBox]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/messages?box=${currentBox}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get('/api/users/team');
      setTeamMembers(response.data.filter(member => member.id !== user.id));
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const messageData = {
        content: newMessage,
        recipientId: isGroupMessage ? null : selectedRecipient,
        isGroupMessage
      };

      const response = await axios.post('/api/messages', messageData);
      
      // Socket.io disabled for production deployment
      // if (socket) {
      //   socket.emit('send-message', {
      //     ...response.data.data,
      //     roomId: user.teamId
      //   });
      // }

      setNewMessage('');
      setSelectedRecipient('');
      
      // Refresh messages if in sent box
      if (currentBox === 'sent') {
        fetchMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`/api/messages/${messageId}`);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      setDeleteDialogOpen(false);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleBoxChange = (event, newValue) => {
    setCurrentBox(newValue);
  };

  const canDeleteMessage = (message) => {
    return message.senderId === user.id || user.role === 'admin';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getMessageRecipient = (message) => {
    if (message.isGroupMessage) return 'Group';
    if (message.senderId === user.id) {
      const recipient = teamMembers.find(m => m.id === message.recipientId);
      return recipient ? `To: ${recipient.name}` : 'To: Unknown';
    }
    return '';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Team Messages
      </Typography>

      <Paper sx={{ 
        height: '80vh', 
        display: 'flex', 
        flexDirection: 'column'
      }}>
        {/* Message Input Area */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Message Type</InputLabel>
              <Select
                value={isGroupMessage ? 'group' : 'private'}
                label="Message Type"
                onChange={(e) => {
                  setIsGroupMessage(e.target.value === 'group');
                  setSelectedRecipient('');
                }}
              >
                <MenuItem value="group">
                  <Group sx={{ mr: 1 }} />
                  Group
                </MenuItem>
                <MenuItem value="private">
                  <Person sx={{ mr: 1 }} />
                  Private
                </MenuItem>
              </Select>
            </FormControl>

            {!isGroupMessage && (
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Recipient</InputLabel>
                <Select
                  value={selectedRecipient}
                  label="Recipient"
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                >
                  {teamMembers.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Type your message here... (Press Ctrl+Enter to send)"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  fontSize: '1rem',
                  lineHeight: 1.5
                }
              }}
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || (!isGroupMessage && !selectedRecipient)}
              sx={{ 
                minWidth: 'auto', 
                px: 3, 
                py: 2,
                height: 'fit-content'
              }}
            >
              <Send />
            </Button>
          </Box>
        </Box>

        {/* Inbox/Sent Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentBox} 
            onChange={handleBoxChange}
            sx={{ px: 2 }}
          >
            <Tab 
              value="inbox" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Inbox />
                  Inbox
                </Box>
              }
            />
            <Tab 
              value="sent" 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SentIcon />
                  Sent
                </Box>
              }
            />
          </Tabs>
        </Box>

        {/* Messages List */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography>Loading messages...</Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <Typography color="text.secondary">
                {currentBox === 'inbox' ? 'No messages in inbox' : 'No sent messages'}
              </Typography>
            </Box>
          ) : (
            <List>
              {messages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    mb: 2,
                    p: 0
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                    <ListItemAvatar>
                      <Avatar>{message.senderName?.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                            {message.senderName}
                          </Typography>
                          {message.type === 'shift_assignment' && (
                            <Chip
                              label="Shift Assignment"
                              size="small"
                              color="success"
                              icon={<Work />}
                            />
                          )}
                          {!message.isGroupMessage && !message.type && (
                            <Chip
                              label="Private"
                              size="small"
                              color="secondary"
                              icon={<Person />}
                            />
                          )}
                          {message.senderId === user.id && (
                            <Chip
                              label="You"
                              size="small"
                              color="primary"
                            />
                          )}
                          {currentBox === 'sent' && !message.isGroupMessage && (
                            <Typography variant="caption" color="text.secondary">
                              {getMessageRecipient(message)}
                            </Typography>
                          )}
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatTime(message.timestamp)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(message.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {canDeleteMessage(message) && (
                        <Tooltip title="Delete message">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedMessage(message);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                  <Paper
                    sx={{
                      p: 3,
                      backgroundColor: message.type === 'shift_assignment' ? 'success.light' : 
                                   message.senderId === user.id ? 'primary.light' : 'grey.100',
                      color: message.senderId === user.id ? 'white' : 'text.primary',
                      maxWidth: '85%',
                      wordBreak: 'break-word',
                      boxShadow: 2,
                      borderRadius: 2,
                      border: message.type === 'shift_assignment' ? '2px solid #4caf50' : 'none'
                    }}
                  >
                    <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                      {message.content}
                    </Typography>
                  </Paper>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          )}
        </Box>

        {/* Refresh Button */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            {messages.length} message{messages.length !== 1 ? 's' : ''} in {currentBox}
          </Typography>
          <Tooltip title="Refresh messages">
            <IconButton onClick={fetchMessages} size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          🗑️ Delete Message
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone.
          </Alert>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Are you sure you want to delete this message?
          </Typography>
          {selectedMessage && (
            <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary">
                "{selectedMessage.content.substring(0, 100)}{selectedMessage.content.length > 100 ? '...' : ''}"
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteMessage(selectedMessage?.id)} 
            color="error"
            variant="contained"
            startIcon={<Delete />}
          >
            Delete Message
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;
