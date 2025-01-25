'use client'
import { isVideoCodec } from '@/lib/types';
import ClientPage from './ClientPage';
import { useParams, useSearchParams } from 'next/navigation';

export default function Page() {
  const {roomName} = useParams();
  const searchParams = useSearchParams();
  const codecString = searchParams.get('codec');
  const codec =
    typeof codecString === 'string' && isVideoCodec(codecString)
      ? codecString
      : 'vp9';
  const hq = searchParams.get('hq') === 'true' ? true : false;
  return (
    <ClientPage roomName={roomName!.toString()} region={searchParams.get('region') || undefined} hq={hq} codec={codec} />
  );
}
