import React, { useEffect, useRef, useState, useId, forwardRef } from "react";

// Glass Effect Variants
type GlassVariant =
  | "navbar" // Horizontal bar, subtle effect
  | "card" // Rounded rectangle, medium effect
  | "modal" // Overlay style, strong effect
  | "dropdown" // Small floating panel
  | "button" // Interactive element
  | "sidebar" // Vertical panel
  | "custom"; // Full control over properties

// Glass Intensity Levels
type GlassIntensity = "subtle" | "medium" | "strong" | "ultra";

// Animation Presets
type AnimationPreset = "none" | "hover" | "focus" | "pulse" | "flow";

export interface LiquidGlassProps {
  children?: React.ReactNode;

  // Variant and Styling
  variant?: GlassVariant;
  intensity?: GlassIntensity;
  animation?: AnimationPreset;

  // Layout
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;

  // Glass Properties (for custom variant)
  blur?: number;
  opacity?: number;
  brightness?: number;
  saturation?: number;
  borderRadius?: number;
  borderWidth?: number;

  // Colors and Theme
  tint?: string;
  borderColor?: string;
  shadowColor?: string;

  // Interaction
  interactive?: boolean;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onHover?: (isHovered: boolean) => void;

  // Advanced
  backdropBlur?: boolean;
  noiseTexture?: boolean;
  reflections?: boolean;

  // Accessibility
  role?: string;
  tabIndex?: number;
  "aria-label"?: string;
}

// Preset configurations for each variant
const GLASS_PRESETS = {
  navbar: {
    subtle: {
      blur: 12,
      opacity: 0.8,
      brightness: 1.1,
      saturation: 1.2,
      borderRadius: 0,
      borderWidth: 0,
    },
    medium: {
      blur: 16,
      opacity: 0.7,
      brightness: 1.15,
      saturation: 1.3,
      borderRadius: 0,
      borderWidth: 1,
    },
    strong: {
      blur: 20,
      opacity: 0.6,
      brightness: 1.2,
      saturation: 1.4,
      borderRadius: 0,
      borderWidth: 1,
    },
    ultra: {
      blur: 24,
      opacity: 0.5,
      brightness: 1.25,
      saturation: 1.5,
      borderRadius: 0,
      borderWidth: 2,
    },
  },
  card: {
    subtle: {
      blur: 10,
      opacity: 0.9,
      brightness: 1.05,
      saturation: 1.1,
      borderRadius: 16,
      borderWidth: 1,
    },
    medium: {
      blur: 14,
      opacity: 0.8,
      brightness: 1.1,
      saturation: 1.2,
      borderRadius: 20,
      borderWidth: 1,
    },
    strong: {
      blur: 18,
      opacity: 0.7,
      brightness: 1.15,
      saturation: 1.3,
      borderRadius: 24,
      borderWidth: 1.5,
    },
    ultra: {
      blur: 22,
      opacity: 0.6,
      brightness: 1.2,
      saturation: 1.4,
      borderRadius: 28,
      borderWidth: 2,
    },
  },
  modal: {
    subtle: {
      blur: 16,
      opacity: 0.85,
      brightness: 1.1,
      saturation: 1.2,
      borderRadius: 12,
      borderWidth: 1,
    },
    medium: {
      blur: 20,
      opacity: 0.75,
      brightness: 1.15,
      saturation: 1.3,
      borderRadius: 16,
      borderWidth: 1,
    },
    strong: {
      blur: 24,
      opacity: 0.65,
      brightness: 1.2,
      saturation: 1.4,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    ultra: {
      blur: 28,
      opacity: 0.55,
      brightness: 1.25,
      saturation: 1.5,
      borderRadius: 24,
      borderWidth: 2,
    },
  },
  dropdown: {
    subtle: {
      blur: 8,
      opacity: 0.9,
      brightness: 1.05,
      saturation: 1.1,
      borderRadius: 8,
      borderWidth: 1,
    },
    medium: {
      blur: 12,
      opacity: 0.8,
      brightness: 1.1,
      saturation: 1.2,
      borderRadius: 12,
      borderWidth: 1,
    },
    strong: {
      blur: 16,
      opacity: 0.7,
      brightness: 1.15,
      saturation: 1.3,
      borderRadius: 16,
      borderWidth: 1.5,
    },
    ultra: {
      blur: 20,
      opacity: 0.6,
      brightness: 1.2,
      saturation: 1.4,
      borderRadius: 20,
      borderWidth: 2,
    },
  },
  button: {
    subtle: {
      blur: 6,
      opacity: 0.95,
      brightness: 1.02,
      saturation: 1.05,
      borderRadius: 8,
      borderWidth: 1,
    },
    medium: {
      blur: 8,
      opacity: 0.9,
      brightness: 1.05,
      saturation: 1.1,
      borderRadius: 12,
      borderWidth: 1,
    },
    strong: {
      blur: 10,
      opacity: 0.85,
      brightness: 1.1,
      saturation: 1.15,
      borderRadius: 16,
      borderWidth: 1,
    },
    ultra: {
      blur: 12,
      opacity: 0.8,
      brightness: 1.15,
      saturation: 1.2,
      borderRadius: 20,
      borderWidth: 1.5,
    },
  },
  sidebar: {
    subtle: {
      blur: 14,
      opacity: 0.85,
      brightness: 1.08,
      saturation: 1.15,
      borderRadius: 0,
      borderWidth: 1,
    },
    medium: {
      blur: 18,
      opacity: 0.75,
      brightness: 1.12,
      saturation: 1.25,
      borderRadius: 0,
      borderWidth: 1,
    },
    strong: {
      blur: 22,
      opacity: 0.65,
      brightness: 1.18,
      saturation: 1.35,
      borderRadius: 0,
      borderWidth: 1.5,
    },
    ultra: {
      blur: 26,
      opacity: 0.55,
      brightness: 1.22,
      saturation: 1.45,
      borderRadius: 0,
      borderWidth: 2,
    },
  },
  custom: {
    subtle: {
      blur: 10,
      opacity: 0.8,
      brightness: 1.1,
      saturation: 1.2,
      borderRadius: 12,
      borderWidth: 1,
    },
    medium: {
      blur: 15,
      opacity: 0.7,
      brightness: 1.15,
      saturation: 1.3,
      borderRadius: 16,
      borderWidth: 1,
    },
    strong: {
      blur: 20,
      opacity: 0.6,
      brightness: 1.2,
      saturation: 1.4,
      borderRadius: 20,
      borderWidth: 1.5,
    },
    ultra: {
      blur: 25,
      opacity: 0.5,
      brightness: 1.25,
      saturation: 1.5,
      borderRadius: 24,
      borderWidth: 2,
    },
  },
};

// Hook for dark mode detection
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return isDark;
};

// Hook for reduced motion preference
const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
};

const LiquidGlass = forwardRef<HTMLDivElement, LiquidGlassProps>(
  (
    {
      children,
      variant = "card",
      intensity = "medium",
      animation = "none",
      width,
      height,
      className = "",
      style = {},

      // Custom properties (override presets)
      blur: customBlur,
      opacity: customOpacity,
      brightness: customBrightness,
      saturation: customSaturation,
      borderRadius: customBorderRadius,
      borderWidth: customBorderWidth,

      // Theming
      tint,
      borderColor,
      shadowColor,

      // Interaction
      interactive = false,
      disabled = false,
      onClick,
      onHover,

      // Advanced
      backdropBlur = true,
      noiseTexture = false,
      reflections = true,

      // Accessibility
      role,
      tabIndex,
      "aria-label": ariaLabel,

      ...props
    },
    ref
  ) => {
    const uniqueId = useId().replace(/:/g, "-");
    const [isHovered, setIsHovered] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isDarkMode = useDarkMode();
    const reducedMotion = useReducedMotion();

    // Get preset configuration
    const preset = GLASS_PRESETS[variant][intensity];

    // Merge custom properties with preset
    const finalConfig = {
      blur: customBlur ?? preset.blur,
      opacity: customOpacity ?? preset.opacity,
      brightness: customBrightness ?? preset.brightness,
      saturation: customSaturation ?? preset.saturation,
      borderRadius: customBorderRadius ?? preset.borderRadius,
      borderWidth: customBorderWidth ?? preset.borderWidth,
    };

    // Generate glass styles
    const getGlassStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        borderRadius: `${finalConfig.borderRadius}px`,
        position: "relative",
        overflow: "hidden",
        ...style,
      };

      // Animation multipliers
      const hoverMultiplier = isHovered && animation === "hover" ? 1.1 : 1;
      const focusMultiplier = isFocused && animation === "focus" ? 1.15 : 1;

      const effectiveBlur =
        finalConfig.blur * hoverMultiplier * focusMultiplier;
      const effectiveBrightness =
        finalConfig.brightness * (isHovered ? 1.05 : 1);
      const effectiveSaturation =
        finalConfig.saturation * (isHovered ? 1.1 : 1);

      // Background color with tint
      const bgColor =
        tint ||
        (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.25)");

      // Border color
      const borderCol =
        borderColor ||
        (isDarkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.3)");

      // Shadow configuration
      const shadowCol =
        shadowColor ||
        (isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(31, 38, 135, 0.2)");

      const glassStyles: React.CSSProperties = {
        ...baseStyles,
        background: bgColor,
        border: `${finalConfig.borderWidth}px solid ${borderCol}`,
        backdropFilter: backdropBlur
          ? `blur(${effectiveBlur}px) saturate(${effectiveSaturation}) brightness(${effectiveBrightness})`
          : "none",
        WebkitBackdropFilter: backdropBlur
          ? `blur(${effectiveBlur}px) saturate(${effectiveSaturation}) brightness(${effectiveBrightness})`
          : "none",
      };

      // Add shadows and highlights for depth
      if (reflections) {
        glassStyles.boxShadow = isDarkMode
          ? `0 8px 32px 0 ${shadowCol},
           0 2px 16px 0 rgba(0, 0, 0, 0.1),
           inset 0 1px 0 0 rgba(255, 255, 255, 0.2),
           inset 0 -1px 0 0 rgba(255, 255, 255, 0.1)`
          : `0 8px 32px 0 ${shadowCol},
           0 2px 16px 0 rgba(31, 38, 135, 0.1),
           inset 0 1px 0 0 rgba(255, 255, 255, 0.4),
           inset 0 -1px 0 0 rgba(255, 255, 255, 0.2)`;
      }

      return glassStyles;
    };

    // Animation classes
    const getAnimationClasses = () => {
      if (reducedMotion || animation === "none") return "";

      const baseTransition = "transition-all duration-300 ease-out";

      switch (animation) {
        case "hover":
          return `${baseTransition} hover:scale-[1.02] hover:shadow-lg`;
        case "focus":
          return `${baseTransition} focus-within:scale-[1.01] focus-within:shadow-md`;
        case "pulse":
          return `${baseTransition} animate-pulse`;
        case "flow":
          return `${baseTransition} hover:backdrop-blur-xl`;
        default:
          return baseTransition;
      }
    };

    // Interactive classes
    const getInteractiveClasses = () => {
      if (!interactive) return "";

      const focusClasses = isDarkMode
        ? "focus-visible:outline-2 focus-visible:outline-blue-400 focus-visible:outline-offset-2"
        : "focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2";

      return `cursor-pointer ${focusClasses} ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`;
    };

    // Event handlers
    const handleMouseEnter = () => {
      setIsHovered(true);
      onHover?.(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      onHover?.(false);
    };

    const handleFocus = () => {
      setIsFocused(true);
    };

    const handleBlur = () => {
      setIsFocused(false);
    };

    const handleClick = (e: React.MouseEvent) => {
      if (disabled) return;
      onClick?.(e);
    };

    // Combine all classes
    const combinedClasses = [
      "relative",
      "flex",
      "items-center",
      "justify-center",
      getAnimationClasses(),
      getInteractiveClasses(),
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // Add noise texture overlay if enabled
    const noiseOverlay = noiseTexture ? (
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          borderRadius: "inherit",
        }}
      />
    ) : null;

    return (
      <div
        ref={ref}
        className={combinedClasses}
        style={getGlassStyles()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleClick}
        role={role}
        tabIndex={interactive ? tabIndex ?? 0 : tabIndex}
        aria-label={ariaLabel}
        aria-disabled={disabled}
        {...props}
      >
        {noiseOverlay}
        <div className="relative z-10 w-full h-full flex items-center justify-center p-2">
          {children}
        </div>
      </div>
    );
  }
);

LiquidGlass.displayName = "LiquidGlass";

export default LiquidGlass;
