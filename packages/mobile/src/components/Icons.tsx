import Svg, { Path, Circle, G } from 'react-native-svg';
import { View } from 'react-native';

interface IconProps {
  color: string;
  size?: number;
}

export function HomeIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function SparklesIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.813 15.904L9 18.75L8.187 15.904C8.05817 15.4539 7.81497 15.0459 7.4816 14.7206C7.14824 14.3952 6.73613 14.1632 6.286 14.047L3.75 13.5L6.286 12.953C6.73613 12.8368 7.14824 12.6048 7.4816 12.2794C7.81497 11.9541 8.05817 11.5461 8.187 11.096L9 8.25L9.813 11.096C9.94183 11.5461 10.185 11.9541 10.5184 12.2794C10.8518 12.6048 11.2639 12.8368 11.714 12.953L14.25 13.5L11.714 14.047C11.2639 14.1632 10.8518 14.3952 10.5184 14.7206C10.185 15.0459 9.94183 15.4539 9.813 15.904Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18.259 10.152L18 11.25L17.741 10.152C17.6165 9.68089 17.3683 9.25277 17.021 8.91134C16.6738 8.56992 16.2401 8.32669 15.766 8.206L14.25 7.875L15.766 7.544C16.2401 7.42331 16.6738 7.18008 17.021 6.83866C17.3683 6.49723 17.6165 6.06911 17.741 5.598L18 4.5L18.259 5.598C18.3835 6.06911 18.6317 6.49723 18.979 6.83866C19.3262 7.18008 19.7599 7.42331 20.234 7.544L21.75 7.875L20.234 8.206C19.7599 8.32669 19.3262 8.56992 18.979 8.91134C18.6317 9.25277 18.3835 9.68089 18.259 10.152Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M16.894 20.567L16.5 21.75L16.106 20.567C16.0143 20.2931 15.8542 20.0476 15.6403 19.8535C15.4265 19.6594 15.166 19.5231 14.883 19.457L13.5 19.125L14.883 18.793C15.166 18.7269 15.4265 18.5906 15.6403 18.3965C15.8542 18.2024 16.0143 17.9569 16.106 17.683L16.5 16.5L16.894 17.683C16.9857 17.9569 17.1458 18.2024 17.3597 18.3965C17.5735 18.5906 17.834 18.7269 18.117 18.793L19.5 19.125L18.117 19.457C17.834 19.5231 17.5735 19.6594 17.3597 19.8535C17.1458 20.0476 16.9857 20.2931 16.894 20.567Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function FolderIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M2.25 12.75V5.25C2.25 4.42157 2.92157 3.75 3.75 3.75H8.58579C8.91731 3.75 9.23525 3.8817 9.46967 4.11612L11.0303 5.67678C11.2648 5.9112 11.5827 6.04289 11.9142 6.04289H20.25C21.0784 6.04289 21.75 6.71447 21.75 7.54289V18.75C21.75 19.5784 21.0784 20.25 20.25 20.25H3.75C2.92157 20.25 2.25 19.5784 2.25 18.75V12.75Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function Cog6ToothIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M9.594 3.94C9.73456 3.39733 10.2263 3.00928 10.7867 3H13.2133C13.7737 3.00928 14.2654 3.39733 14.406 3.94L14.619 4.793C14.7169 5.18238 14.9811 5.5108 15.3407 5.69673C15.7003 5.88266 16.1212 5.90893 16.5 5.769L17.321 5.469C17.8436 5.27885 18.4249 5.487 18.7147 5.96667L19.928 8.03333C20.2177 8.51299 20.1325 9.12933 19.724 9.512L19.082 10.112C18.7862 10.3891 18.6199 10.7776 18.6199 11.1837C18.6199 11.5898 18.7862 11.9784 19.082 12.2555L19.724 12.8555C20.1325 13.2382 20.2177 13.8545 19.928 14.3342L18.7147 16.4008C18.4249 16.8805 17.8436 17.0886 17.321 16.8985L16.5 16.5985C16.1212 16.4585 15.7003 16.4848 15.3407 16.6707C14.9811 16.8567 14.7169 17.1851 14.619 17.5745L14.406 18.4275C14.2654 18.9702 13.7737 19.3582 13.2133 19.3675H10.7867C10.2263 19.3582 9.73456 18.9702 9.594 18.4275L9.381 17.5745C9.28308 17.1851 9.01891 16.8567 8.65931 16.6707C8.29971 16.4848 7.87884 16.4585 7.5 16.5985L6.679 16.8985C6.15644 17.0886 5.57514 16.8805 5.28534 16.4008L4.072 14.3342C3.78225 13.8545 3.86746 13.2382 4.276 12.8555L4.918 12.2555C5.21383 11.9784 5.38006 11.5898 5.38006 11.1837C5.38006 10.7776 5.21383 10.3891 4.918 10.112L4.276 9.512C3.86746 9.12933 3.78225 8.51299 4.072 8.03333L5.28534 5.96667C5.57514 5.487 6.15644 5.27885 6.679 5.469L7.5 5.769C7.87884 5.90893 8.29971 5.88266 8.65931 5.69673C9.01891 5.5108 9.28308 5.18238 9.381 4.793L9.594 3.94Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="12" cy="11.5" r="2.5" stroke={color} strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

export function StarIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M11.48 3.499C11.672 2.942 12.328 2.942 12.52 3.499L14.448 9.243H20.414C20.975 9.243 21.208 9.971 20.758 10.328L15.929 14.157L17.857 19.901C18.049 20.458 17.456 20.921 16.996 20.564L12 16.735L7.004 20.564C6.544 20.921 5.951 20.458 6.143 19.901L8.071 14.157L3.242 10.328C2.792 9.971 3.025 9.243 3.586 9.243H9.552L11.48 3.499Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ArrowLeftIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M10.5 19.5L3 12M3 12L10.5 4.5M3 12H21"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function DocumentTextIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M19.5 14.25V11.25C19.5 9.59315 18.1569 8.25 16.5 8.25H14.25C13.4216 8.25 12.75 7.57843 12.75 6.75V4.5C12.75 2.84315 11.4069 1.5 9.75 1.5H6M6 1.5H4.5C3.67157 1.5 3 2.17157 3 3V21C3 21.8284 3.67157 22.5 4.5 22.5H18C18.8284 22.5 19.5 21.8284 19.5 21V17.25M6 1.5L12.75 8.25L19.5 15V17.25M19.5 17.25H15.75C14.9216 17.25 14.25 17.9216 14.25 18.75V22.5"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function GitCompareIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="6" cy="6" r="2.25" stroke={color} strokeWidth={1.5} />
        <Circle cx="18" cy="18" r="2.25" stroke={color} strokeWidth={1.5} />
        <Path
          d="M6 8.25V15C6 16.6569 7.34315 18 9 18H15.75"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M18 15.75V9C18 7.34315 16.6569 6 15 6H8.25"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function BabyIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="5" stroke={color} strokeWidth={1.5} />
        <Path
          d="M3 21C3 17.134 7.029 14 12 14C16.971 14 21 17.134 21 21"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M9 8H9.01M15 8H15.01"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
        />
        <Path
          d="M10 11C10.5 11.5 11 12 12 12C13 12 13.5 11.5 14 11"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function UsersIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="9" cy="7" r="3.25" stroke={color} strokeWidth={1.5} />
        <Path
          d="M12.5 21H2.5C2.5 17.134 5.634 14 9.5 14C10.726 14 11.882 14.324 12.885 14.896"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M16 7.25C17.2426 7.25 18.25 8.25736 18.25 9.5C18.25 10.7426 17.2426 11.75 16 11.75"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        <Path
          d="M19 21H14.5C14.5 18.5147 16.5147 16.5 19 16.5C19.6237 16.5 20.2172 16.6318 20.7534 16.8696"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function PlusIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 5V19M5 12H19"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function TrashIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M14.74 9L14.394 18M9.606 18L9.26 9M19.228 5.79C19.5698 5.84157 19.9104 5.89688 20.25 5.9559M19.228 5.79L18.16 19.673C18.1164 20.2382 17.8803 20.7614 17.4909 21.1489C17.1015 21.5364 16.5847 21.75 16.044 21.75H7.956C7.41528 21.75 6.89851 21.5364 6.50911 21.1489C6.11971 20.7614 5.88361 20.2382 5.84 19.673L4.772 5.79M19.228 5.79C18.0739 5.62487 16.9128 5.50457 15.748 5.42939M4.772 5.79C4.43024 5.84157 4.08963 5.89688 3.75 5.9559M4.772 5.79C5.92608 5.62487 7.08719 5.50457 8.252 5.42939M15.748 5.42939V4.481C15.748 3.351 14.898 2.402 13.768 2.369C12.592 2.335 11.408 2.335 10.232 2.369C9.102 2.402 8.252 3.351 8.252 4.481V5.42939M15.748 5.42939C13.2539 5.26038 10.7461 5.26038 8.252 5.42939"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function MagnifyingGlassIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M21 21L15.0001 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function FunnelIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 3C2.25 3 2.25 4.5 2.25 6V6.75C2.25 7.5 2.625 8.25 3 8.625L8.25 13.875C9 14.625 9 15 9 15.75V19.5C9 20.25 9.75 21 10.5 21H13.5C14.25 21 15 20.25 15 19.5V15.75C15 15 15 14.625 15.75 13.875L21 8.625C21.375 8.25 21.75 7.5 21.75 6.75V6C21.75 4.5 21.75 3 12 3Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ClipboardIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15.666 3.88889C15.2097 3.34041 14.4934 3 13.5 3H10.5C9.50657 3 8.79026 3.34041 8.33397 3.88889M15.666 3.88889C15.9417 4.21961 16.1102 4.63417 16.1766 5.1M15.666 3.88889C16.9648 4.06179 17.8938 4.48914 18.4914 5.25C19.5 6.5375 19.5 8.53333 19.5 12.525V13.575C19.5 17.5667 19.5 19.5625 18.4914 20.85C17.4828 22.125 15.6542 22.125 12 22.125C8.34583 22.125 6.51725 22.125 5.50862 20.85C4.5 19.5625 4.5 17.5667 4.5 13.575V12.525C4.5 8.53333 4.5 6.5375 5.50862 5.25C6.10624 4.48914 7.03518 4.06179 8.33397 3.88889M8.33397 3.88889C8.26777 4.63417 8.43634 5.21961 8.71204 5.1M8.33397 3.88889C8.26777 3.34041 8.43634 2.89041 8.71204 2.7"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 12H15M9 16H12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ChatBubbleIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M8.625 9.75H8.634M12 9.75H12.009M15.375 9.75H15.384M21 12C21 16.5563 16.9706 20.25 12 20.25C10.8005 20.25 9.65582 20.0376 8.60714 19.6514L4.5 21L5.67 18.0857C4.01809 16.5769 3 14.4746 3 12C3 7.44365 7.02944 3.75 12 3.75C16.9706 3.75 21 7.44365 21 12Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function PaperAirplaneIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 12L3 3L21 12L3 21L6 12Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M6 12H13.5"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function ClipboardDocumentIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M15.666 3.88889C15.2097 3.34041 14.4934 3 13.5 3H10.5C9.50657 3 8.79026 3.34041 8.33397 3.88889M15.666 3.88889C15.9417 4.21961 16.1102 4.63417 16.1766 5.1M15.666 3.88889C16.9648 4.06179 17.8938 4.48914 18.4914 5.25C19.5 6.5375 19.5 8.53333 19.5 12.525V13.575C19.5 17.5667 19.5 19.5625 18.4914 20.85C17.4828 22.125 15.6542 22.125 12 22.125C8.34583 22.125 6.51725 22.125 5.50862 20.85C4.5 19.5625 4.5 17.5667 4.5 13.575V12.525C4.5 8.53333 4.5 6.5375 5.50862 5.25C6.10624 4.48914 7.03518 4.06179 8.33397 3.88889M8.33397 3.88889C8.26777 4.63417 8.43634 5.21961 8.71204 5.1"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M9 12.375H15M9 16.125H12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

export function PencilIcon({ color, size = 24 }: IconProps) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M16.862 4.487L18.549 2.799C19.082 2.266 19.918 2.266 20.451 2.799C20.984 3.332 20.984 4.168 20.451 4.701L9.126 16.026C8.734 16.418 8.241 16.692 7.703 16.82L5.25 17.438L5.868 14.985C5.996 14.447 6.27 13.954 6.662 13.562L16.862 4.487Z"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M15 6L18.5 9.5"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H12"
          stroke={color}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
