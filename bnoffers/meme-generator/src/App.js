import React, { useState, useRef } from 'react';
import { Box, Button, Paper, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemButton, ListItemText, TextField } from '@mui/material';
import html2canvas from 'html2canvas';

function App() {
  const [avatar, setAvatar] = useState(null);
  const [background, setBackground] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [nickname, setNickname] = useState('');
  const [displayNickname, setDisplayNickname] = useState('');
  const memeRef = useRef(null);

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
      });
    }
  };

  const handleSubmitNickname = () => {
    setDisplayNickname(nickname);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          component="label"
          sx={{ flex: 1 }}
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
          sx={{ flex: 1 }}
        >
          选择模式
        </Button>
        <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
          <TextField
            placeholder="请输入您的昵称"
            variant="outlined"
            size="small"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Button
            variant="contained"
            onClick={handleSubmitNickname}
            sx={{ flex: 0.5 }}
          >
            提交昵称
          </Button>
        </Box>
      </Box>

      <Paper
        ref={memeRef}
        sx={{
          position: 'relative',
          width: '66.67%',
          paddingBottom: '37.5%',
          margin: '0 auto',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5'
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

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleDownload}
          disabled={!avatar || !background}
        >
          Free Mint
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>选择模式</DialogTitle>
        <DialogContent>
          <List>
            {Object.keys(modeBackgrounds).map((mode) => (
              <ListItem key={mode} disablePadding>
                <ListItemButton onClick={() => handleModeSelect(mode)}>
                  <ListItemText primary={mode} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default App;
