import React, { useState, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
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
  DialogActions,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import html2canvas from 'html2canvas';
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';

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
  const homeRef = useRef(null);
  // eslint-disable-next-line no-unused-vars
  const [value, setValue] = useState(0);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(null);

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

  const handleFollowTwitter = () => {
    window.open('https://twitter.com/nineteen_888', '_blank');
  };

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 1500);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundImage: 'url(/images/pyramid-scene.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
    }}>
      <AppBar position="fixed" sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(5px)',
        boxShadow: 3,
        zIndex: 1200
      }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ color: '#FFD700', fontFamily: 'Press Start 2P, cursive' }}>
            十九的玩梗小屋🌟
          </Typography>
          <Box>
            <Button color="inherit" onClick={() => scrollToSection(homeRef)} sx={{ fontFamily: 'Press Start 2P, cursive', mx: 1 }}>Home</Button>
            <Button color="inherit" onClick={() => scrollToSection(buildRef)} sx={{ fontFamily: 'Press Start 2P, cursive', mx: 1 }}>Build</Button>
            <Button color="inherit" onClick={() => scrollToSection(collaborateRef)} sx={{ fontFamily: 'Press Start 2P, cursive', mx: 1 }}>Collaborate</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ pt: 8, position: 'relative', zIndex: 1 }}>
        {/* Home Section */}
        <Box ref={homeRef} sx={{ 
          minHeight: '100vh', 
          py: 4,
          backgroundColor: 'transparent',
          backdropFilter: 'none'
        }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
              您有一份Offer 待领取..
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
                      backgroundColor: '#4a90e2',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                      '&:hover': {
                        backgroundColor: '#357abd',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    请输入您的昵称
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
        <Box ref={buildRef} sx={{
          minHeight: '100vh',
          py: 4,
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#FFD700', fontSize: '3rem' }}>
              Coming Soon
            </Typography>
          </Container>
        </Box>

        {/* Collaborate Section */}
        <Box ref={collaborateRef} sx={{
          minHeight: '100vh',
          py: 4,
          backgroundColor: 'transparent',
          backdropFilter: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Container maxWidth="lg">
            <Typography variant="h4" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: '#FFD700', fontSize: '3rem' }}>
              联系方式
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
              <IconButton onClick={() => window.open('https://x.com/nineteen_888', '_blank')} sx={{ color: '#FFD700', '& svg': { width: 40, height: 40 } }}>
                <TwitterIcon />
              </IconButton>
              <IconButton onClick={() => window.open('https://t.me/nineteen_888', '_blank')} sx={{ color: '#0088cc', '& svg': { width: 40, height: 40 } }}>
                <TelegramIcon />
              </IconButton>
            </Box>
            <Box sx={{ textAlign: 'center', marginTop: 4, padding: 2, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 2, maxWidth: '600px', margin: '0 auto' }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#333', fontWeight: 'bold' }}>
                创作不泳衣，感谢打赏～
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                EVM 地址：<span onClick={() => handleCopyAddress('0x73ba1d3da1a577dc1f5daea2e962d70457e74543')} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007BFF', backgroundColor: copiedAddress === '0x73ba1d3da1a577dc1f5daea2e962d70457e74543' ? 'rgba(0, 123, 255, 0.2)' : 'transparent', transition: 'background-color 0.3s' }}>0x73ba1d3da1a577dc1f5daea2e962d70457e74543</span>
              </Typography>
              <Typography variant="body1" gutterBottom sx={{ color: '#555' }}>
                SOL 地址：<span onClick={() => handleCopyAddress('GErytsX7HgLskrnG9xsBSJMADwYb8QofSRXzmzWQMvFn')} style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007BFF', backgroundColor: copiedAddress === 'GErytsX7HgLskrnG9xsBSJMADwYb8QofSRXzmzWQMvFn' ? 'rgba(0, 123, 255, 0.2)' : 'transparent', transition: 'background-color 0.3s' }}>GErytsX7HgLskrnG9xsBSJMADwYb8QofSRXzmzWQMvFn</span>
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>选择模式</DialogTitle>
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

      <style>
        {`
          @keyframes swing {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(10deg); }
            50% { transform: rotate(0deg); }
            75% { transform: rotate(-10deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>
      <Box sx={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2000 }}>
        <img src="/images/swinging-image.png" alt="Swinging" style={{ width: 100, height: 100 }} />
        <Button variant="contained" color="primary" onClick={() => { console.log('Button clicked'); setValue(2); scrollToSection(collaborateRef); }} sx={{ marginTop: 2 }}>
          💰打赏作者
        </Button>
      </Box>
    </Box>
  );
}

export default App;
