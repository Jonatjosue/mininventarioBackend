const formatearHora = (fecha, formato = "HH:MM:SS", tipoRetorno = "string") => {
  if (!fecha) return null;

  const date = new Date(fecha);
  const horas = date.getHours();
  const minutos = date.getMinutes();
  const segundos = date.getSeconds();

  if (tipoRetorno === "numero") {
    switch (formato) {
      case "HH:MM":
        return horas * 100 + minutos; // 1430 para 14:30
      case "HH:MM:SS":
        return horas * 10000 + minutos * 100 + segundos; // 143025 para 14:30:25
      default:
        return horas * 10000 + minutos * 100 + segundos;
    }
  }

  // Retorno como objeto Date para Prisma (campos Time)
  if (tipoRetorno === "prisma-time") {
    // Crear la fecha en zona horaria local explícitamente
    const timeString = `${String(horas).padStart(2, "0")}:${String(
      minutos
    ).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;

    // Usar toISOString pero forzar la hora local
    const ahora = new Date();
    const fechaLocal = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      horas,
      minutos,
      segundos
    );

    // Extraer solo la parte de la hora en formato ISO
    return new Date(
      fechaLocal.toISOString().split("T")[0] + "T" + timeString + "Z"
    );
  }

  // Retorno como objeto con múltiples formatos
  if (tipoRetorno === "objeto") {
    const horasStr = String(horas).padStart(2, "0");
    const minutosStr = String(minutos).padStart(2, "0");
    const segundosStr = String(segundos).padStart(2, "0");

    return {
      horas: horas,
      minutos: minutos,
      segundos: segundos,
      comoString: `${horasStr}:${minutosStr}:${segundosStr}`,
      comoStringCorto: `${horasStr}:${minutosStr}`,
      comoNumero: horas * 100 + minutos,
      comoNumeroCompleto: horas * 10000 + minutos * 100 + segundos,
      paraPrisma: new Date(
        `1970-01-01T${horasStr}:${minutosStr}:${segundosStr}`
      ),
    };
  }

  // Retorno normal como string (por defecto)
  const horasStr = String(horas).padStart(2, "0");
  const minutosStr = String(minutos).padStart(2, "0");
  const segundosStr = String(segundos).padStart(2, "0");

  switch (formato) {
    case "HH:MM":
      return `${horasStr}:${minutosStr}`;
    case "HH:MM:SS":
      return `${horasStr}:${minutosStr}:${segundosStr}`;
    case "12h":
      return date.toLocaleTimeString("es-GT", { hour12: true });
    default:
      return `${horasStr}:${minutosStr}:${segundosStr}`;
  }
};

// Función helper específica para Prisma
const obtenerHoraParaPrisma = (fecha) => {
  if (!fecha) return null;
  return formatearHora(fecha, "HH:MM:SS", "prisma-time");
};

// Función para convertir número de hora a objeto Prisma
const numeroHoraAPrisma = (numeroHora) => {
  if (numeroHora === null || numeroHora === undefined) return null;

  let horas, minutos, segundos;

  if (numeroHora < 10000) {
    // Formato HHMM (1430)
    horas = Math.floor(numeroHora / 100);
    minutos = numeroHora % 100;
    segundos = 0;
  } else {
    // Formato HHMMSS (143025)
    horas = Math.floor(numeroHora / 10000);
    minutos = Math.floor((numeroHora % 10000) / 100);
    segundos = numeroHora % 100;
  }

  const horasStr = String(horas).padStart(2, "0");
  const minutosStr = String(minutos).padStart(2, "0");
  const segundosStr = String(segundos).padStart(2, "0");

  return new Date(`1970-01-01T${horasStr}:${minutosStr}:${segundosStr}`);
};

module.exports = {
  formatearHora,
  obtenerHoraParaPrisma,
  numeroHoraAPrisma,
};
