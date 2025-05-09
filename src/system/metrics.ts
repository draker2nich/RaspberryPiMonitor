import si from 'systeminformation';
import { exec } from 'child_process';
import { promisify } from 'util';
import config from '../config';
import logger from '../utils/logger';

const execAsync = promisify(exec);

export interface SystemMetrics {
  timestamp: number;
  cpu: {
    temperature: number;
    load: number;
    temperatureStatus: 'green' | 'yellow' | 'red';
  };
  memory: {
    total: number;
    used: number;
    usedPercentage: number;
  };
  disk: {
    total: number;
    used: number;
    usedPercentage: number;
  };
  network: {
    status: 'online' | 'offline';
  };
}

// Get CPU temperature status based on thresholds
function getCpuTemperatureStatus(temperature: number): 'green' | 'yellow' | 'red' {
  const { green, yellow } = config.monitoring.cpuTemperature.thresholds;
  
  if (temperature < green) {
    return 'green';
  } else if (temperature < yellow) {
    return 'yellow';
  } else {
    return 'red';
  }
}

// Get CPU temperature (Raspberry Pi specific)
async function getCpuTemperature(): Promise<number> {
  try {
    // Use the Raspberry Pi specific command to get CPU temperature
    const { stdout } = await execAsync('cat /sys/class/thermal/thermal_zone0/temp');
    // Convert from millidegree to degree Celsius
    return parseFloat(stdout) / 1000;
  } catch (error) {
    logger.error(`Error getting CPU temperature: ${error}`);
    return 0;
  }
}

// Check if the system is online
async function checkNetworkStatus(): Promise<'online' | 'offline'> {
  try {
    // Try to ping Google's DNS to check internet connectivity
    await execAsync('ping -c 1 8.8.8.8');
    return 'online';
  } catch (error) {
    return 'offline';
  }
}

// Get all system metrics
export async function getSystemMetrics(): Promise<SystemMetrics> {
  try {
    // Get CPU temperature
    const cpuTemperature = await getCpuTemperature();
    
    // Get CPU load
    const cpuLoad = await si.currentLoad();
    
    // Get memory info
    const memInfo = await si.mem();
    
    // Get disk info
    const diskInfo = await si.fsSize();
    const rootDisk = diskInfo.find(disk => disk.mount === '/') || diskInfo[0];
    
    // Check network status
    const networkStatus = await checkNetworkStatus();
    
    return {
      timestamp: Date.now(),
      cpu: {
        temperature: cpuTemperature,
        load: cpuLoad.currentLoad,
        temperatureStatus: getCpuTemperatureStatus(cpuTemperature),
      },
      memory: {
        total: memInfo.total,
        used: memInfo.used,
        usedPercentage: (memInfo.used / memInfo.total) * 100,
      },
      disk: {
        total: rootDisk.size,
        used: rootDisk.used,
        usedPercentage: rootDisk.use,
      },
      network: {
        status: networkStatus,
      },
    };
  } catch (error) {
    logger.error(`Error collecting system metrics: ${error}`);
    throw error;
  }
}
