import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemText, 
  TextField, 
  Container, 
  Typography, 
  Grid,
  AppBar,
  Toolbar,
  Tab,
  Tabs,
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';

function App() {
  const [avatar, setAvatar] = useState(null);
  const [background, setBackground] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openThankDialog, setOpenThankDialog] = useState(false);
  const [nickname, setNickname] = useState('');
  const [displayNickname, setDisplayNickname] = useState('');
  const memeRef = useRef(null);
  const buildRef = useRef(null);
  const collaborateRef = useRef(null);

  const modeBackgrounds = {
    '模式1-入职': '/images/onboarding.png',
    '模式2-被辞退': '/images/termination.png',
    '模式3-入学': '/images/enrollment.png'
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModeSelect = (mode) => {
    setBackground(modeBackgrounds[mode]);
    setOpenDialog(false);
  };

  const handleDownload = () => {
    if (memeRef.current) {
      html2canvas(memeRef.current).then(canvas => {
        const link = document.createElement('a');
        link.download = 'meme.png';
        link.href = canvas.toDataURL();
        link.click();
        setOpenThankDialog(true);
      });
    }
  };

  const handleSubmitNickname = () => {
    setDisplayNickname(nickname);
  };

  const handleTabClick = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFollowTwitter = () => {
    window.open('https://twitter.com/nineteen_888', '_blank');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 2 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            BN Offers
          </Typography>
          <Tabs sx={{ minHeight: 64 }}>
            <Tab label="Home" onClick={() => handleTabClick(memeRef)} />
            <Tab label="Build" onClick={() => handleTabClick(buildRef)} />
            <Tab label="Collaborate" onClick={() => handleTabClick(collaborateRef)} />
          </Tabs>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 8 }}>
        {/* Home Section */}
        <Box ref={memeRef} sx={{ minHeight: '100vh', py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
              头像生成器
            </Typography>

            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2,
                  position: 'sticky',
                  top: 100
                }}>
                  <Button
                    variant="contained"
                    component="label"
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    上传头像
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleAvatarUpload}
                    />
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => setOpenDialog(true)}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    选择模式
                  </Button>
                  <TextField
                    placeholder="请输入您的昵称"
                    variant="outlined"
                    size="small"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        boxShadow: 1
                      }
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmitNickname}
                    sx={{ 
                      py: 1.5,
                      px: 3,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    提交昵称
                  </Button>
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Paper
                    ref={memeRef}
                    sx={{
                      position: 'relative',
                      width: '533.36%',
                      paddingBottom: '300%',
                      margin: '0 auto',
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5',
                      borderRadius: 4,
                      boxShadow: 4
                    }}
                  >
                    {background && (
                      <img
                        src={background}
                        alt="背景"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    {avatar && (
                      <img
                        src={avatar}
                        alt="头像"
                        style={{
                          position: 'absolute',
                          top: '20%',
                          left: '15%',
                          transform: 'translate(-50%, -50%)',
                          width: '133px',
                          height: '133px',
                          borderRadius: '50%',
                          border: '4px solid white',
                          boxShadow: '0 0 10px rgba(0,0,0,0.3)'
                        }}
                      />
                    )}
                    {displayNickname && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '43%',
                          left: '15%',
                          transform: 'translate(-50%, -50%)',
                          color: 'black',
                          fontSize: '24px',
                          fontWeight: 'bold',
                          textShadow: '2px 2px 4px rgba(255,255,255,0.5)',
                          textAlign: 'center'
                        }}
                      >
                        {displayNickname}
                      </div>
                    )}
                  </Paper>

                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownload}
                    disabled={!avatar || !background}
                    sx={{ 
                      mt: 4,
                      py: 1.5,
                      px: 4,
                      borderRadius: 2,
                      boxShadow: 2,
                      '&:hover': {
                        boxShadow: 4
                      }
                    }}
                  >
                    Free Mint
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Build Section */}
        <Box ref={buildRef} sx={{ minHeight: '100vh', py: 4, bgcolor: '#f5f5f5' }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              构建页面
            </Typography>
          </Container>
        </Box>

        {/* Collaborate Section */}
        <Box ref={collaborateRef} sx={{ minHeight: '100vh', py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              协作页面
            </Typography>
          </Container>
        </Box>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>选择模式</DialogTitle>
        <DialogContent>
          <List>
            {Object.keys(modeBackgrounds).map((mode) => (
              <ListItem key={mode} disablePadding>
                <ListItemButton 
                  onClick={() => handleModeSelect(mode)}
                  sx={{
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText primary={mode} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={openThankDialog} 
        onClose={() => setOpenThankDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4,
            minWidth: '300px',
            position: 'relative'
          }
        }}
      >
        <IconButton
          aria-label="close"
          onClick={() => setOpenThankDialog(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', pt: 3 }}>
          感谢支持，创作不易
        </DialogTitle>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={handleFollowTwitter}
            sx={{
              py: 1,
              px: 3,
              borderRadius: 2,
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4
              }
            }}
          >
            快来关注我的 X 吧
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default App;
