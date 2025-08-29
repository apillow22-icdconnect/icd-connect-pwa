import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  School,
  Upload,
  Download,
  Delete,
  Description,
  Person,
  CalendarToday,
  Assignment
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Training = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [trainingData, setTrainingData] = useState({
    title: '',
    description: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await axios.get('/api/training');
      setModules(response.data);
    } catch (error) {
      console.error('Error fetching training modules:', error);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUploadTraining = async () => {
    if (!trainingData.title || !trainingData.content) {
      setError('Please fill in title and content');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('title', trainingData.title);
      formData.append('description', trainingData.description);
      formData.append('content', trainingData.content);

      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      await axios.post('/api/training', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setUploadDialogOpen(false);
      setSelectedFiles([]);
      setTrainingData({
        title: '',
        description: '',
        content: ''
      });
      fetchModules();
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading training');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await axios.delete(`/api/training/${moduleId}`);
      fetchModules();
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const handleDownloadFile = (file) => {
    const link = document.createElement('a');
    link.href = `${file.filePath}`;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to categorize files by type
  const categorizeFiles = (files) => {
    const documents = [];
    const videos = [];
    
    files.forEach(file => {
      const fileName = file.originalName || file.name || '';
      const fileExtension = fileName.toLowerCase().split('.').pop();
      
      // Video file extensions
      const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
      // Document file extensions
      const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'ppt', 'pptx', 'xls', 'xlsx'];
      
      if (videoExtensions.includes(fileExtension)) {
        videos.push(file);
      } else if (documentExtensions.includes(fileExtension)) {
        documents.push(file);
      } else {
        // Default to documents for unknown extensions
        documents.push(file);
      }
    });
    
    return { documents, videos };
  };

  // Get file type icon
  const getFileTypeIcon = (fileName) => {
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'];
    
    if (videoExtensions.includes(fileExtension)) {
      return '🎥';
    } else {
      return '📄';
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh', pt: 6, px: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, position: 'relative', zIndex: 10, mt: 4, pt: 2 }}>
        <Typography variant="h4">
          Training Modules
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<Upload />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ 
              fontSize: '1.1rem', 
              py: 2.5, 
              px: 5,
              position: 'relative',
              zIndex: 50,
              backgroundColor: '#1976d2',
              boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
              border: '3px solid #1565c0',
              borderRadius: '8px',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#1565c0',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                transform: 'translateY(-3px)'
              }
            }}
          >
            📤 UPLOAD TRAINING
          </Button>
        )}
      </Box>

      {modules.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No training modules available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isAdmin 
                ? 'Upload the first training module to get started'
                : 'Training modules will appear here once uploaded by admin'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {modules.map((module) => (
            <Grid item xs={12} md={6} lg={4} key={module.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {module.title}
                    </Typography>
                    <Box>
                      {module.teachBackRequired && (
                        <Chip
                          label="Teach-back Required"
                          size="small"
                          color="warning"
                          icon={<Assignment />}
                          sx={{ mr: 1 }}
                        />
                      )}
                      <Chip
                        label={module.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={module.isActive ? 'success' : 'default'}
                      />
                    </Box>
                  </Box>
                  
                  {module.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {module.description}
                    </Typography>
                  )}

                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Person fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created by"
                        secondary={module.creatorName}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <CalendarToday fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created"
                        secondary={formatDate(module.createdDate)}
                      />
                    </ListItem>
                  </List>

                  {module.files && module.files.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        📎 Attachments ({module.files.length}):
                      </Typography>
                      
                      {(() => {
                        const { documents, videos } = categorizeFiles(module.files);
                        
                        return (
                          <>
                            {/* Videos Section */}
                            {videos.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                                  🎥 Videos ({videos.length})
                                </Typography>
                                <List dense>
                                  {videos.map((file, index) => (
                                    <ListItem key={`video-${index}`} sx={{ px: 0 }}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Box component="span" sx={{ color: '#ff4444' }}>🎥</Box>
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={file.originalName}
                                        secondary={`${file.fileType.toUpperCase()} file`}
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDownloadFile(file)}
                                        title="Download video"
                                      >
                                        <Download />
                                      </IconButton>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                            
                            {/* Documents Section */}
                            {documents.length > 0 && (
                              <Box>
                                <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                                  📄 Documents ({documents.length})
                                </Typography>
                                <List dense>
                                  {documents.map((file, index) => (
                                    <ListItem key={`doc-${index}`} sx={{ px: 0 }}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Box component="span" sx={{ color: '#2196f3' }}>📄</Box>
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={file.originalName}
                                        secondary={`${file.fileType.toUpperCase()} file`}
                                      />
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDownloadFile(file)}
                                        title="Download document"
                                      >
                                        <Download />
                                      </IconButton>
                                    </ListItem>
                                  ))}
                                </List>
                              </Box>
                            )}
                          </>
                        );
                      })()}
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedModule(module);
                      setViewDialogOpen(true);
                    }}
                  >
                    View Content
                  </Button>
                  {isAdmin && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Training Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>📤 Upload Training Content</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <TextField
            fullWidth
            label="Training Title"
            value={trainingData.title}
            onChange={(e) => setTrainingData({ ...trainingData, title: e.target.value })}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Description (Optional)"
            value={trainingData.description}
            onChange={(e) => setTrainingData({ ...trainingData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
          
          <TextField
            fullWidth
            label="Training Content"
            value={trainingData.content}
            onChange={(e) => setTrainingData({ ...trainingData, content: e.target.value })}
            margin="normal"
            multiline
            rows={6}
            required
          />
          
          <Box sx={{ mt: 3, p: 3, border: '3px dashed #1976d2', borderRadius: 2, backgroundColor: '#f3f8ff' }}>
            <Typography variant="h6" gutterBottom align="center" color="primary">
              📁 Upload Files (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
              Supported: PDF, DOC, DOCX, PPT, PPTX, MP4, AVI, MOV, JPG, PNG
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Max: 50MB per file (up to 5 files)
            </Typography>
            
            <input
              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.avi,.mov,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="training-files"
              type="file"
              multiple
              onChange={handleFileSelect}
            />
            <label htmlFor="training-files">
              <Button
                variant="contained"
                component="span"
                startIcon={<Upload />}
                fullWidth
                sx={{ py: 2, fontSize: '1.1rem' }}
              >
                {selectedFiles.length > 0 
                  ? `📁 ${selectedFiles.length} file(s) selected` 
                  : '📁 Choose Files to Upload'
                }
              </Button>
            </label>
            
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Selected Files:
                </Typography>
                
                {(() => {
                  const { documents, videos } = categorizeFiles(selectedFiles);
                  
                  return (
                    <>
                      {/* Videos Section */}
                      {videos.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                            🎥 Videos ({videos.length})
                          </Typography>
                          <List dense>
                            {videos.map((file, index) => (
                              <ListItem key={`video-${index}`} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Box component="span" sx={{ color: '#ff4444' }}>🎥</Box>
                                </ListItemIcon>
                                <ListItemText
                                  primary={file.name}
                                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                      
                      {/* Documents Section */}
                      {documents.length > 0 && (
                        <Box>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold', display: 'block', mb: 1 }}>
                            📄 Documents ({documents.length})
                          </Typography>
                          <List dense>
                            {documents.map((file, index) => (
                              <ListItem key={`doc-${index}`} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Box component="span" sx={{ color: '#2196f3' }}>📄</Box>
                                </ListItemIcon>
                                <ListItemText
                                  primary={file.name}
                                  secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </>
                  );
                })()}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleUploadTraining}
            variant="contained"
            disabled={loading || !trainingData.title || !trainingData.content}
          >
            {loading ? 'Uploading...' : 'Upload Training'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Module Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {selectedModule?.title}
        </DialogTitle>
        <DialogContent>
          {selectedModule && (
            <Box>
              {selectedModule.description && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {selectedModule.description}
                </Typography>
              )}
              
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3 }}>
                {selectedModule.content}
              </Typography>

              {selectedModule.files && selectedModule.files.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📎 Attached Files
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedModule.files.map((file, index) => {
                      const isVideo = /\.(mp4|avi|mov)$/i.test(file.originalName);
                      const isImage = /\.(jpg|jpeg|png)$/i.test(file.originalName);
                      
                      return (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                {isVideo ? (
                                  <Box component="span" sx={{ color: '#ff4444', mr: 1 }}>🎥</Box>
                                ) : isImage ? (
                                  <Box component="span" sx={{ color: '#4caf50', mr: 1 }}>🖼️</Box>
                                ) : (
                                  <Box component="span" sx={{ color: '#2196f3', mr: 1 }}>📄</Box>
                                )}
                                <Typography variant="subtitle1">
                                  {file.originalName}
                                </Typography>
                              </Box>
                              
                              {isVideo && (
                                <Box sx={{ mb: 2 }}>
                                  <video 
                                    controls 
                                    width="100%" 
                                    style={{ maxHeight: '400px' }}
                                    src={`${file.filePath}`}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </Box>
                              )}
                              
                              {isImage && (
                                <Box sx={{ mb: 2 }}>
                                  <img 
                                    src={`${file.filePath}`}
                                    alt={file.originalName}
                                    style={{ 
                                      maxWidth: '100%', 
                                      maxHeight: '400px',
                                      objectFit: 'contain'
                                    }}
                                  />
                                </Box>
                              )}
                              
                              <Button
                                variant="outlined"
                                startIcon={<Download />}
                                onClick={() => handleDownloadFile(file)}
                                fullWidth
                              >
                                Download {file.originalName}
                              </Button>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Training;
