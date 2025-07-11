import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton,
  Alert,
  useTheme,
  useMediaQuery,
  Pagination,
  Box as MuiBox,
  Collapse,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  HistoryOutlined,
  SearchOutlined,
  FilterListOutlined,
  ErrorOutlineOutlined,
  WarningAmberOutlined,
  InfoOutlined,
  BugReportOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  RefreshOutlined
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useThemeContext } from '../../../components/Tools/ThemeContext';

const LogsReport = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const { isDarkTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Configuración de colores dinámicos
  const colors = {
    background: isDarkTheme ? '#0f1419' : '#f8fafc',
    cardBg: isDarkTheme ? '#1e293b' : '#ffffff',
    headerBg: isDarkTheme ? '#334155' : '#f1f5f9',
    text: isDarkTheme ? '#f1f5f9' : '#1e293b',
    secondaryText: isDarkTheme ? '#94a3b8' : '#64748b',
    primary: isDarkTheme ? '#3b82f6' : '#2563eb',
    success: isDarkTheme ? '#10b981' : '#059669',
    warning: isDarkTheme ? '#f59e0b' : '#d97706',
    error: isDarkTheme ? '#ef4444' : '#dc2626',
    debug: isDarkTheme ? '#8b5cf6' : '#7c3aed',
    border: isDarkTheme ? '#374151' : '#e2e8f0',
    hover: isDarkTheme ? 'rgba(59, 130, 246, 0.1)' : 'rgba(37, 99, 235, 0.05)',
    shadow: isDarkTheme 
      ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
      : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  };

  // Configuración de niveles de log - mapeo completo
  const LOG_LEVELS = {
    // Formatos en inglés (estándar)
    ERROR: { 
      color: colors.error, 
      icon: ErrorOutlineOutlined, 
      label: 'Error',
      variants: ['ERROR', 'error', 'Error']
    },
    WARNING: { 
      color: colors.warning, 
      icon: WarningAmberOutlined, 
      label: 'Advertencia',
      variants: ['WARNING', 'warning', 'Warning', 'WARN', 'warn', 'Warn']
    },
    INFO: { 
      color: colors.success, 
      icon: InfoOutlined, 
      label: 'Información',
      variants: ['INFO', 'info', 'Info', 'Información', 'información', 'INFORMATION']
    },
    DEBUG: { 
      color: colors.debug, 
      icon: BugReportOutlined, 
      label: 'Debug',
      variants: ['DEBUG', 'debug', 'Debug']
    }
  };

  // Cargar logs al montar
  useEffect(() => {
    fetchLogs();
  }, []);

  // Filtrar logs cuando cambien los filtros
  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, levelFilter]);

  // Normalizar nivel de log para mapping consistente
  const normalizeLogLevel = (level) => {
    if (!level) return 'INFO';
    
    const levelUpper = level.toString().toUpperCase();
    
    // Buscar en las variantes de cada nivel
    for (const [standardLevel, config] of Object.entries(LOG_LEVELS)) {
      if (config.variants.some(variant => variant.toUpperCase() === levelUpper)) {
        return standardLevel;
      }
    }
    
    // Si no encuentra coincidencia, default a INFO
    return 'INFO';
  };

  // Obtener logs del servidor
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://back-end-4803.onrender.com/api/reportes/logs');
      
      if (!response.ok) throw new Error('Error al obtener los logs');
      
      const data = await response.json();
      
      // Normalizar los niveles de log
      const normalizedLogs = data.map(log => ({
        ...log,
        originalLevel: log.level, // Guardar el nivel original
        level: normalizeLogLevel(log.level) // Nivel normalizado
      }));
      
      // Debug: mostrar información sobre normalización
      console.log('🔍 Logs procesados:', {
        total: normalizedLogs.length,
        levelsSample: normalizedLogs.slice(0, 5).map(l => ({ 
          original: l.originalLevel, 
          normalized: l.level 
        })),
        uniqueLevels: [...new Set(data.map(l => l.level))],
        normalizedLevels: [...new Set(normalizedLogs.map(l => l.level))]
      });
      
      setLogs(normalizedLogs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar logs según criterios
  const filterLogs = () => {
    let filtered = logs;

    // Filtro por nivel
    if (levelFilter !== 'ALL') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }

    // Filtro por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.level.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset pagination
  };

  // Manejar expansión de filas
  const toggleRowExpansion = (logId) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedRows(newExpanded);
  };

  // Obtener color según nivel (usando nivel normalizado)
  const getLevelConfig = (level) => {
    const normalizedLevel = normalizeLogLevel(level);
    return LOG_LEVELS[normalizedLevel] || LOG_LEVELS.INFO;
  };

  // Formatear mensaje para mostrar
  const formatMessage = (message, expanded = false) => {
    if (!message) return 'Sin mensaje';
    
    if (expanded || message.length <= 80) {
      return message;
    }
    
    return `${message.substring(0, 80)}...`;
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const endIndex = startIndex + logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Conteo por niveles para estadísticas
  const levelCounts = logs.reduce((acc, log) => {
    acc[log.level] = (acc[log.level] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header y estadísticas */}
      <Card
        elevation={0}
        sx={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          mb: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <HistoryOutlined sx={{ color: colors.primary, fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                  Auditoría del Sistema
                </Typography>
                <Typography variant="body2" sx={{ color: colors.secondaryText }}>
                  {filteredLogs.length} de {logs.length} registros
                  {levelFilter !== 'ALL' && ` • Filtrado por: ${LOG_LEVELS[levelFilter]?.label}`}
                  {searchTerm && ` • Búsqueda: "${searchTerm}"`}
                </Typography>
              </Box>
            </Stack>
            <Tooltip title="Actualizar logs">
              <IconButton
                onClick={fetchLogs}
                sx={{
                  bgcolor: colors.primary,
                  color: 'white',
                  '&:hover': { bgcolor: colors.primary, opacity: 0.8 }
                }}
              >
                <RefreshOutlined />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Estadísticas por nivel */}
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={2} 
            sx={{ mb: 3 }}
          >
            {Object.entries(LOG_LEVELS).map(([level, config]) => {
              const IconComponent = config.icon;
              const count = levelCounts[level] || 0;
              
              return (
                <Card
                  key={level}
                  sx={{
                    flex: 1,
                    bgcolor: colors.headerBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 2
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: config.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <IconComponent sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600 }}>
                          {count}
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.secondaryText }}>
                          {config.label}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {/* Filtros */}
          <Stack 
            direction={isMobile ? 'column' : 'row'} 
            spacing={2} 
            alignItems="center"
          >
            <TextField
              placeholder="Buscar en logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                minWidth: isMobile ? '100%' : 300,
                '& .MuiOutlinedInput-root': {
                  bgcolor: colors.background,
                  '& fieldset': { borderColor: colors.border },
                  '&:hover fieldset': { borderColor: colors.primary },
                  '&.Mui-focused fieldset': { borderColor: colors.primary }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlined sx={{ color: colors.secondaryText }} />
                  </InputAdornment>
                )
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                label="Nivel"
                sx={{
                  bgcolor: colors.background,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.border },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary }
                }}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {Object.entries(LOG_LEVELS).map(([level, config]) => (
                  <MenuItem key={level} value={level}>
                    {config.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Tabla de logs */}
      <Card
        elevation={0}
        sx={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead sx={{ bgcolor: colors.headerBg }}>
              <TableRow>
                <TableCell sx={{ color: colors.text, fontWeight: 600, width: 60 }}></TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 600, width: 80 }}>ID</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 600, width: 120 }}>Nivel</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 600 }}>Mensaje</TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 600, width: 180 }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentLogs.map((log) => {
                const levelConfig = getLevelConfig(log.level);
                const IconComponent = levelConfig.icon;
                const isExpanded = expandedRows.has(log.id);
                const shouldShowExpand = log.message && log.message.length > 80;

                return (
                  <React.Fragment key={log.id}>
                    <TableRow
                      sx={{
                        '&:hover': { bgcolor: colors.hover },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell>
                        {shouldShowExpand && (
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(log.id)}
                            sx={{ color: colors.secondaryText }}
                          >
                            {isExpanded ? <ExpandLessOutlined /> : <ExpandMoreOutlined />}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, fontFamily: 'monospace' }}>
                        {log.id}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={<IconComponent sx={{ fontSize: 16 }} />}
                          label={levelConfig.label}
                          size="small"
                          sx={{
                            bgcolor: levelConfig.color,
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 90
                          }}
                        />
                        {/* Mostrar nivel original si es diferente */}
                        {log.originalLevel && log.originalLevel !== log.level && (
                          <Typography
                            variant="caption"
                            sx={{
                              display: 'block',
                              color: colors.secondaryText,
                              fontSize: '0.7rem',
                              mt: 0.5,
                              fontStyle: 'italic'
                            }}
                          >
                            Original: {log.originalLevel}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, maxWidth: 400 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak: 'break-word',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                          }}
                        >
                          {formatMessage(log.message, isExpanded)}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: colors.text, fontFamily: 'monospace' }}>
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
                      </TableCell>
                    </TableRow>
                    
                    {/* Fila expandida para mensaje completo */}
                    {shouldShowExpand && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ p: 0, border: 'none' }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: colors.headerBg, borderTop: `1px solid ${colors.border}` }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: colors.text,
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {log.message}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(event, page) => setCurrentPage(page)}
              color="primary"
              size={isMobile ? 'small' : 'medium'}
              sx={{
                '& .MuiPaginationItem-root': {
                  color: colors.text,
                  '&.Mui-selected': {
                    bgcolor: colors.primary,
                    color: 'white'
                  }
                }
              }}
            />
          </Box>
        )}
      </Card>
    </Container>
  );
};

export default LogsReport;