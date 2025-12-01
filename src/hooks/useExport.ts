import { useCallback } from 'react';
import { TakeoffMeasurement } from './useMeasurements';

export const useExport = () => {
  const exportToCSV = useCallback((measurements: TakeoffMeasurement[], page?: number) => {
    if (measurements.length === 0) {
      alert('No measurements to export');
      return;
    }

    // Cabeçalho CSV
    const headers = [
      'ID',
      'Type',
      'Label',
      'Length (ft)',
      'Area (sq ft)',
      'Unit',
      'Notes',
      'Page',
    ];

    // Converter medições para linhas CSV
    const rows = measurements.map(measurement => [
      measurement.id,
      measurement.type,
      measurement.label,
      measurement.length?.toFixed(2) || '',
      measurement.area?.toFixed(2) || '',
      measurement.unit,
      measurement.notes || '',
      page?.toString() || '',
    ]);

    // Combinar cabeçalho e linhas
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Criar blob e fazer download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `takeoff-measurements-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const exportToJSON = useCallback((measurements: TakeoffMeasurement[], scale?: string) => {
    if (measurements.length === 0) {
      alert('No measurements to export');
      return;
    }

    const exportData = {
      scale: scale || '1" = 100\'',
      exportedAt: new Date().toISOString(),
      measurements: measurements.map(m => ({
        id: m.id,
        type: m.type,
        label: m.label,
        coordinates: m.coordinates,
        length: m.length,
        area: m.area,
        unit: m.unit,
        notes: m.notes,
        color: m.color,
        trenchWidth: m.trenchWidth,
        trenchDepth: m.trenchDepth,
        spoilVolumeCY: m.spoilVolumeCY,
        asphaltRemoval: m.asphaltRemoval,
        concreteRemoval: m.concreteRemoval,
        backfill: m.backfill,
        conduits: m.conduits,
        hydroExcavationType: m.hydroExcavationType,
        hydroHoleShape: m.hydroHoleShape,
        hydroHoleDimensions: m.hydroHoleDimensions,
        hydroPotholingData: m.hydroPotholingData,
        vaultDimensions: m.vaultDimensions,
        holeSize: m.holeSize,
        vaultSpoilVolumeCY: m.vaultSpoilVolumeCY,
        vaultAsphaltRemovalCY: m.vaultAsphaltRemovalCY,
        vaultConcreteRemovalCY: m.vaultConcreteRemovalCY,
        vaultAsphaltRestorationCY: m.vaultAsphaltRestorationCY,
        vaultConcreteRestorationCY: m.vaultConcreteRestorationCY,
        vaultBackfillCY: m.vaultBackfillCY,
        vaultBackfillType: m.vaultBackfillType,
        vaultTrafficRated: m.vaultTrafficRated,
      })),
    };

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `takeoff-measurements-${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return {
    exportToCSV,
    exportToJSON,
  };
};

