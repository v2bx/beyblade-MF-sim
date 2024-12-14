function getBeybladeProperties(beybladeType) {
  switch (beybladeType) {
    case "flame_sagitarrio":
      return {
        angularVelocity: () => 50, // Massively increased
        initialSpeed: () => 3,
        stamina: 120,
        attackPower: 5,
        defensePower: 3,
        friction: 0.002,
      };
    case "earth_eagle":
      return {
        angularVelocity: () => 60, // Massively increased
        initialSpeed: () => 2,
        stamina: 150,
        attackPower: 4,
        defensePower: 4,
        friction: 0.01,
      };
    case "lightning_l_drago":
      return {
        angularVelocity: () => 150, // Massively increased
        initialSpeed: () => 20,
        stamina: 80,
        attackPower: 6,
        defensePower: 2,
        friction: 0.005,
      };
    case "gpegasus":
      return {
        angularVelocity: () => 100, // Massively increased
        initialSpeed: () => 20,
        stamina: 90,
        attackPower: 7,
        defensePower: 1,
        friction: 0.004,
      };
    case "rock_leone":
      return {
        angularVelocity: () => 40, // Massively increased
        initialSpeed: () => 5,
        stamina: 130,
        attackPower: 3,
        defensePower: 8,
        friction: 1,
      };
    case "basalt":
      return {
        angularVelocity: () => 50, // Massively increased
        initialSpeed: () => 6,
        stamina: 140,
        attackPower: 2,
        defensePower: 9,
        friction: 0.001,
      };
    case "dark_wolf":
      return {
        angularVelocity: () => 70, // Massively increased
        initialSpeed: () => 10,
        stamina: 85,
        attackPower: 5,
        defensePower: 5,
        friction: 0.003,
      };
    case "rock_scorpio":
      return {
        angularVelocity: () => 70, // Massively increased
        initialSpeed: () => 8,
        stamina: 80,
        attackPower: 4,
        defensePower: 6,
        friction: 0.003,
      };
    case "storm_pegasus":
      return {
        angularVelocity: () => 100, // Massively increased
        initialSpeed: () => 20,
        stamina: 75,
        attackPower: 7,
        defensePower: 3,
        friction: 0.004,
      };
    default:
      return {
        angularVelocity: () => 20, // Massively increased for defaults
        initialSpeed: () => 3,
        stamina: 100,
        attackPower: 5,
        defensePower: 5,
        friction: 0.005,
      };
  }
}
