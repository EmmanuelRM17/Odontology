// CustomRecaptcha.js
import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { Refresh } from '@mui/icons-material';

const RECAPTCHA_SITE_KEY = '6Lc74mAqAAAAAL5MmFjf4x0PWP9MtBNEy9ypux_h';
const LOAD_TIMEOUT = 5000;

const CustomRecaptcha = ({ onCaptchaChange, isDarkMode = false }) => {
    const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const recaptchaRef = useRef(null);
    const loadingTimerRef = useRef(null);
    const mountedRef = useRef(true);

    const cleanupTimers = () => {
        if (loadingTimerRef.current) {
            clearTimeout(loadingTimerRef.current);
            loadingTimerRef.current = null;
        }
    };

    const resetCaptcha = useCallback(() => {
        setLoadError(false);
        setIsCaptchaLoading(true);
        
        if (recaptchaRef.current) {
            recaptchaRef.current.reset();
        }
        
        initializeCaptcha();
    }, []);

    const initializeCaptcha = useCallback(() => {
        cleanupTimers();

        loadingTimerRef.current = setTimeout(() => {
            if (mountedRef.current) {
                if (!window.grecaptcha) {
                    setLoadError(true);
                    setIsCaptchaLoading(false);
                }
            }
        }, LOAD_TIMEOUT);

        const checkRecaptchaLoad = () => {
            if (window.grecaptcha && window.grecaptcha.render) {
                if (mountedRef.current) {
                    setIsCaptchaLoading(false);
                    cleanupTimers();
                }
            } else if (mountedRef.current) {
                setTimeout(checkRecaptchaLoad, 100);
            }
        };

        checkRecaptchaLoad();
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        initializeCaptcha();

        return () => {
            mountedRef.current = false;
            cleanupTimers();
        };
    }, [initializeCaptcha]);

    const handleCaptchaChange = useCallback((value) => {
        try {
            if (mountedRef.current) {
                setIsCaptchaLoading(false);
                onCaptchaChange(value);
            }
        } catch (error) {
            console.error('Error en el captcha:', error);
            if (recaptchaRef.current) {
                recaptchaRef.current.reset();
            }
            onCaptchaChange(null);
        }
    }, [onCaptchaChange]);

    const handleError = useCallback(() => {
        if (mountedRef.current) {
            setLoadError(true);
            setIsCaptchaLoading(false);
            onCaptchaChange(null);
        }
    }, [onCaptchaChange]);

    return (
        <Box 
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '78px',
                position: 'relative'
            }}
        >
            {isCaptchaLoading && (
                <CircularProgress size={24} />
            )}

            {!isCaptchaLoading && (
                <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={handleCaptchaChange}
                    onError={handleError}
                    onExpired={() => onCaptchaChange(null)}
                    theme={isDarkMode ? 'dark' : 'light'}
                />
            )}

            {/* Botón de recarga solo visible cuando hay error */}
            {loadError && (
                <Box 
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        justifyContent: 'center',
                        mt: 1
                    }}
                >
                    <IconButton
                        onClick={resetCaptcha}
                        color="primary"
                        size="small"
                        sx={{
                            bgcolor: 'background.paper',
                            boxShadow: 1,
                            '&:hover': {
                                bgcolor: 'action.hover'
                            }
                        }}
                    >
                        <Refresh fontSize="small" />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default React.memo(CustomRecaptcha);