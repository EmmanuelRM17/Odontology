import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    IconButton,
    TextField,
    Typography,
    Tooltip,
    Zoom,
    styled
} from '@mui/material';
import {
    Close as CloseIcon,
    Send as SendIcon,
    SwapHoriz as SwapHorizIcon,
    Lightbulb as LightbulbIcon
} from '@mui/icons-material';

// Custom Tooth Icon
const ToothIcon = ({ className }) => (
    <svg
        className={className}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="currentColor"
        style={{
            animation: 'rotateIcon 0.3s ease-in-out'
        }}
    >
        <path d="M12 2C7.58 2 4 5.58 4 10c0 2.52 1.17 4.76 3 6.24V20c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-3.76c1.83-1.48 3-3.72 3-6.24 0-4.42-3.58-8-8-8z" />
    </svg>
);

const INSTRUCCIONES = [
    "¡Bienvenido al Asistente Dental! 🦷",
    "Estoy aquí para ayudarte con:",
    "• Agendar citas",
    "• Resolver dudas sobre tratamientos",
    "• Atender emergencias dentales",
    "• Proporcionar consejos de higiene dental",
    "• Ofrecer presupuestos aproximados"
];

const ChatWindow = styled(Box)(({ theme, isDarkTheme }) => ({
    width: '350px',
    height: '500px',
    display: 'flex',
    margin: '5px',
    flexDirection: 'column',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '4px 4px 10px rgba(0,0,0,0.2)',
    background: isDarkTheme
        ? 'linear-gradient(135deg, #1C2A38 0%, #1C2A38 100%)'
        : 'linear-gradient(90deg, #ffffff 0%, #E5F3FD 100%)',
    border: `1px solid ${isDarkTheme ? '#03427C' : '#0561B3'}`,
    animation: 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '@keyframes slideIn': {
        '0%': {
            opacity: 0,
            transform: 'translateY(50px) scale(0.9)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateY(0) scale(1)',
        },
    },
}));

const MessageArea = styled(Box)(({ isDarkTheme }) => ({
    flexGrow: 1,
    overflowY: 'auto',
    padding: '16px',
    background: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    scrollBehavior: 'smooth',
}));

const Message = styled(Box)(({ isUser, isDarkTheme }) => ({
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: isUser ? '12px 12px 0 12px' : '12px 12px 12px 0',
    background: isUser
        ? isDarkTheme ? 'rgba(3, 66, 124, 0.8)' : '#03427C'
        : isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : '#E5F3FD',
    color: isUser
        ? '#ffffff'
        : isDarkTheme ? 'rgba(255, 255, 255, 0.9)' : '#03427C',
    textShadow: isUser ? '2px 2px 4px rgba(0,0,0,0.2)' : 'none',
    animation: 'messageSlide 0.3s ease-out',
    '@keyframes messageSlide': {
        '0%': {
            opacity: 0,
            transform: isUser ? 'translateX(20px)' : 'translateX(-20px)',
        },
        '100%': {
            opacity: 1,
            transform: 'translateX(0)',
        },
    },
}));

const ChatButton = styled(IconButton)(({ isDarkTheme }) => ({
    width: '56px',
    height: '56px',
    background: isDarkTheme
        ? 'linear-gradient(135deg, #1C2A38 0%, #03427C 100%)'
        : 'linear-gradient(90deg, #03427C 0%, #0561B3 100%)',
    color: '#ffffff',
    boxShadow: '4px 4px 6px rgba(0,0,0,0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '28px',
    '&:hover': {
        background: isDarkTheme
            ? 'linear-gradient(135deg, #03427C 0%, #1C2A38 100%)'
            : 'linear-gradient(90deg, #0561B3 0%, #03427C 100%)',
        transform: 'scale(1.1)',
    },
    '@keyframes rotateIcon': {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
    },
}));

const FAQ_QUESTIONS = [
    "¿Cuánto cuesta una limpieza dental?",
    "¿Cada cuánto debo visitar al dentista?",
    "¿Qué hacer en caso de dolor dental?",
    "¿Cuánto dura un blanqueamiento?",
    "¿Aceptan todas las aseguradoras?"
];

const QuickQuestions = styled(Box)(({ isDarkTheme }) => ({
    position: 'absolute',
    right: '100%',
    top: '0',
    marginRight: '10px',
    backgroundColor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
    borderRadius: '10px',
    padding: '10px',
    width: '250px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    border: `1px solid ${isDarkTheme ? '#03427C' : '#0561B3'}`,
    animation: 'fadeIn 0.3s ease-out',
    '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(-10px)' },
        to: { opacity: 1, transform: 'translateY(0)' }
    }
}));

const DentalChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState('right');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const messagesEndRef = useRef(null);
    const tooltipTimeoutRef = useRef(null);
    const [showQuickQuestions, setShowQuickQuestions] = useState(false);


    // Theme detection
    useEffect(() => {
        const matchDarkTheme = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDarkTheme(matchDarkTheme.matches);

        const handleThemeChange = (e) => setIsDarkTheme(e.matches);
        matchDarkTheme.addEventListener('change', handleThemeChange);
        return () => matchDarkTheme.removeEventListener('change', handleThemeChange);
    }, []);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                text: INSTRUCCIONES.join('\n'),
                isUser: false
            }]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleMouseEnter = () => {
        tooltipTimeoutRef.current = setTimeout(() => {
            setShowTooltip(true);
        }, 5000);
    };

    const handleMouseLeave = () => {
        clearTimeout(tooltipTimeoutRef.current);
        setShowTooltip(false);
    };

    const togglePosition = () => {
        setPosition(prev => prev === 'right' ? 'left' : 'right');
    };

    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!message.trim()) return;

        setMessages(prev => [...prev, { text: message, isUser: true }]);
        setMessage('');

        // Simular respuesta del bot
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: "Gracias por tu consulta. ¿En qué puedo ayudarte?",
                isUser: false
            }]);
        }, 1000);
    };

    const getChatPosition = () => ({
        position: 'fixed',
        bottom: '32px',
        [position]: '88px',
        zIndex: 999,
    });

    const getButtonPosition = () => ({
        position: 'fixed',
        bottom: '32px',
        [position]: '32px',
        zIndex: 1000,
    });

    return (
        <>
            {isOpen && (
                <Box sx={getChatPosition()}>
                    <ChatWindow isDarkTheme={isDarkTheme}>
                        <Box sx={{
                            p: 2,
                            background: isDarkTheme
                                ? 'linear-gradient(135deg, #03427C 0%, #1C2A38 100%)'
                                : 'linear-gradient(90deg, #03427C 0%, #0561B3 100%)',
                            color: '#ffffff',
                            borderTopLeftRadius: 20,
                            borderTopRightRadius: 20,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            position: 'relative'  // Agregado para posicionamiento del menú
                        }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 500,
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                                    WebkitTextStroke: '.5px rgba(255,255,255,0.8)'
                                }}
                            >
                                Asistente Dental
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton
                                    size="small"
                                    onClick={() => setShowQuickQuestions(prev => !prev)}
                                    sx={{
                                        color: 'inherit',
                                        mr: 1,
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    <LightbulbIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={togglePosition}
                                    sx={{
                                        color: 'inherit',
                                        mr: 1,
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            backgroundColor: 'rgba(255,255,255,0.1)',
                                        },
                                    }}
                                >
                                    <SwapHorizIcon />
                                </IconButton>
                            </Box>

                            {showQuickQuestions && (
                                <QuickQuestions isDarkTheme={isDarkTheme} sx={{ position: 'absolute', top: '40px', right: 0 }}>
                                    {FAQ_QUESTIONS.map((question, index) => (
                                        <Box
                                            key={index}
                                            onClick={() => {
                                                setMessage(question);
                                                setShowQuickQuestions(false);
                                            }}
                                            sx={{
                                                p: 1,
                                                cursor: 'pointer',
                                                borderRadius: '8px',
                                                mb: 0.5,
                                                color: isDarkTheme ? '#ffffff' : '#03427C',
                                                '&:hover': {
                                                    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(3,66,124,0.1)',
                                                },
                                                transition: 'all 0.2s ease'
                                            }}
                                        >
                                            {question}
                                        </Box>
                                    ))}
                                </QuickQuestions>
                            )}
                        </Box>

                        <MessageArea isDarkTheme={isDarkTheme}>
                            {messages.map((msg, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                                        mb: 1,
                                    }}
                                >
                                    <Message isUser={msg.isUser} isDarkTheme={isDarkTheme}>
                                        <Typography variant="body2" style={{ whiteSpace: 'pre-line' }}>
                                            {msg.text}
                                        </Typography>
                                    </Message>
                                </Box>
                            ))}
                            <div ref={messagesEndRef} />
                        </MessageArea>

                        <Box
                            component="form"
                            onSubmit={handleSendMessage}
                            sx={{
                                p: 2,
                                backgroundColor: isDarkTheme ? '#1B2A3A' : '#F9FDFF',
                                display: 'flex',
                                gap: 1,
                                borderTop: `1px solid ${isDarkTheme ? 'rgba(3, 66, 124, 0.8)' : 'rgba(255, 255, 255, 0.3)'}`,
                            }}
                        >
                            <TextField
                                fullWidth
                                size="small"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Escribe tu mensaje..."
                                variant="outlined"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 4,
                                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                                        color: isDarkTheme ? '#ffffff' : '#03427C',
                                        '&:hover': {
                                            '& fieldset': {
                                                borderColor: isDarkTheme ? 'rgba(3, 66, 124, 0.8)' : '#03427C',
                                            }
                                        },
                                        '& fieldset': {
                                            borderColor: isDarkTheme ? 'rgba(3, 66, 124, 0.4)' : 'rgba(3, 66, 124, 0.2)',
                                        }
                                    },
                                    '& input::placeholder': {
                                        color: isDarkTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgba(3, 66, 124, 0.5)',
                                    }
                                }}
                            />
                            <IconButton
                                type="submit"
                                disabled={!message.trim()}
                                sx={{
                                    color: isDarkTheme ? '#ffffff' : '#03427C',
                                    '&:hover': {
                                        backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(3, 66, 124, 0.1)',
                                    }
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Box>
                    </ChatWindow>
                </Box>
            )}

            <Box
                sx={getButtonPosition()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <Tooltip
                    open={showTooltip && !isOpen}
                    title="¿Tienes una duda dental?"
                    TransitionComponent={Zoom}
                    placement={position === 'right' ? 'left' : 'right'}
                >
                    <ChatButton
                        isDarkTheme={isDarkTheme}
                        onClick={() => setIsOpen(!isOpen)}
                        sx={{
                            animation: isOpen ? 'none' : 'pulse 2s infinite',
                            '@keyframes pulse': {
                                '0%': { transform: 'scale(1)' },
                                '50%': { transform: 'scale(1.05)' },
                                '100%': { transform: 'scale(1)' },
                            },
                        }}
                    >
                        {isOpen ? <CloseIcon /> : <ToothIcon />}
                    </ChatButton>
                </Tooltip>
            </Box>
        </>
    );
};

export default DentalChat;