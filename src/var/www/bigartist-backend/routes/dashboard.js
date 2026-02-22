const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/dashboard - Obtener estadísticas del dashboard
router.get('/', async (req, res) => {
  try {
    console.log('📊 Dashboard: Obteniendo estadísticas...');

    // Obtener datos de todas las tablas
    const [artists] = await pool.query('SELECT * FROM artists');
    const [tracks] = await pool.query('SELECT * FROM tracks');
    const [royalties] = await pool.query('SELECT * FROM royalties');
    const [csvUploads] = await pool.query('SELECT * FROM csv_uploads ORDER BY upload_date DESC');

    console.log(`📊 Datos obtenidos: ${artists.length} artistas, ${tracks.length} tracks, ${royalties.length} royalties`);

    // Calcular totales desde royalties
    const totalRevenue = royalties.reduce((sum, r) => sum + parseFloat(r.total_revenue || 0), 0);
    const totalStreams = royalties.reduce((sum, r) => sum + parseInt(r.total_streams || 0), 0);

    console.log(`💰 Total Revenue: €${totalRevenue.toFixed(2)}`);
    console.log(`🎵 Total Streams: ${totalStreams}`);

    // Construir datos de plataformas, territorios y períodos desde csv_data de artistas
    const platformsMap = new Map();
    const territoriesMap = new Map();
    const periodsMap = new Map();

    artists.forEach(artist => {
      if (artist.csv_data) {
        try {
          const csvData = JSON.parse(artist.csv_data);
          
          // Agregar plataformas
          if (csvData.platforms && Array.isArray(csvData.platforms)) {
            csvData.platforms.forEach(p => {
              platformsMap.set(p.name, (platformsMap.get(p.name) || 0) + p.revenue);
            });
          }

          // Agregar territorios
          if (csvData.territories && Array.isArray(csvData.territories)) {
            csvData.territories.forEach(t => {
              territoriesMap.set(t.name, (territoriesMap.get(t.name) || 0) + t.revenue);
            });
          }

          // Agregar períodos
          if (csvData.periods && Array.isArray(csvData.periods)) {
            csvData.periods.forEach(p => {
              periodsMap.set(p.period, (periodsMap.get(p.period) || 0) + p.revenue);
            });
          }
        } catch (e) {
          console.error(`Error parseando csv_data del artista ${artist.name}:`, e);
        }
      }
    });

    // Convertir Maps a arrays
    const platforms = Array.from(platformsMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const territories = Array.from(territoriesMap.entries())
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    const periods = Array.from(periodsMap.entries())
      .map(([period, revenue]) => ({ period, revenue }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // Top artistas por revenue
    const topArtists = artists
      .map(a => ({
        name: a.name,
        revenue: parseFloat(a.total_revenue || 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Construir royalties data para el frontend
    const royaltiesData = royalties.map(r => {
      const artist = artists.find(a => a.name === r.artist_name);
      let tracks = [];
      let platforms = [];
      let territories = [];
      let periods = [];

      if (artist && artist.csv_data) {
        try {
          const csvData = JSON.parse(artist.csv_data);
          tracks = csvData.tracks || [];
          platforms = csvData.platforms || [];
          territories = csvData.territories || [];
          periods = csvData.periods || [];
        } catch (e) {
          console.error(`Error parseando royalty data para ${r.artist_name}`);
        }
      }

      return {
        artistName: r.artist_name,
        totalRevenue: parseFloat(r.total_revenue || 0),
        totalStreams: parseInt(r.total_streams || 0),
        tracks,
        platforms,
        territories,
        periods
      };
    });

    const response = {
      success: true,
      data: {
        totalRevenue,
        totalStreams,
        totalArtists: artists.length,
        totalTracks: tracks.length,
        platforms,
        territories,
        periods,
        topArtists,
        artists: artists.map(a => ({
          id: a.id,
          name: a.name,
          email: a.email,
          photo: a.photo,
          totalRevenue: parseFloat(a.total_revenue || 0),
          totalStreams: parseInt(a.total_streams || 0)
        })),
        tracks: tracks.map(t => ({
          id: t.id,
          title: t.title,
          artist_name: t.artist_name,
          isrc: t.isrc,
          totalRevenue: parseFloat(t.total_revenue || 0),
          totalStreams: parseInt(t.total_streams || 0)
        })),
        royalties: royaltiesData,
        csvUploads: csvUploads.map(csv => ({
          id: csv.id,
          filename: csv.filename,
          total_rows: csv.total_rows,
          total_revenue: parseFloat(csv.total_revenue || 0),
          upload_date: csv.upload_date,
          processed: csv.processed
        }))
      }
    };

    console.log('✅ Dashboard stats calculados exitosamente');
    res.json(response);

  } catch (error) {
    console.error('❌ Error en dashboard:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
