import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router';
import imageCompression from 'browser-image-compression';
import { Camera, Images, LoaderCircle, TriangleAlert, Wifi, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import CocoaPodIcon from '../../components/ui/CocoaPodIcon';
import ErrorState from '../../components/ui/ErrorState';
import Skeleton from '../../components/ui/Skeleton';
import StaffWizardLayout from '../../layouts/StaffWizardLayout';
import {
  addPodPhotos,
  analyseInspection,
  getInspection,
  removePodPhoto,
} from '../../services/inspectionService';
import { formatShortDate, pluralPods } from '../../utils/format';
import { inspectionPath, isAnalysed, wizardStepPath } from '../../utils/inspectionRoutes';
import {
  ACCEPTED_PHOTO_TYPES,
  MAX_PHOTO_SIZE_MB,
  MAX_POD_PHOTOS,
  PHOTO_COMPRESSION,
} from '../../utils/inspectionRules';

// O3: Pod photos (step 2 of 4: Photos). Owner: Ain (CLAUDE.md section 13b).
// Design: docs/design/pod/staff/O3-pod-photos.html
const PHOTO_TIPS = [
  'One pod per photo, filling most of the frame',
  'Good light, no heavy shadow',
  'Upload only the best photo of each pod',
];

const PENDING_LABELS = { compressing: 'Compressing…', uploading: 'Uploading…' };

// Checks one file before compressing. Returns an error message, or null if the file is OK.
function checkPhotoFile(file) {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return `${file.name}: file is not a JPG, PNG or WebP image.`;
  }
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return `${file.name}: too large (max ${MAX_PHOTO_SIZE_MB} MB).`;
  }
  return null;
}

// One square in the grid: the photo (or a placeholder in mock data), the "Pod N" label and
// an optional remove button / status overlay.
function PodTile({ name, photoUrl, overlay, onRemove, removeDisabled }) {
  return (
    <li className="relative h-26 overflow-hidden rounded bg-primary-soft">
      {photoUrl ? (
        <img src={photoUrl} alt={name} className="size-full object-cover" />
      ) : (
        <span className="flex size-full items-center justify-center text-primary-light">
          <CocoaPodIcon className="size-10" />
        </span>
      )}

      <span className="absolute bottom-2 left-2 rounded-md bg-text/70 px-2 py-0.5 text-sm font-bold text-white">
        {name}
      </span>

      {overlay && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-text/55 text-xs font-semibold text-white">
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          {overlay}
        </span>
      )}

      {onRemove && (
        // 44px tap area with a smaller white circle inside (as in the mockup).
        <button
          type="button"
          onClick={onRemove}
          disabled={removeDisabled}
          aria-label={`Remove ${name}`}
          className="group absolute top-0 right-0 flex size-11 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-surface/90 text-text group-hover:bg-surface group-focus-visible:outline-2 group-focus-visible:outline-accent">
            <X className="size-3.5" strokeWidth={2.6} aria-hidden="true" />
          </span>
        </button>
      )}
    </li>
  );
}

function PhotosSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <Skeleton className="h-28 w-full" />
      <div className="grid grid-cols-2 gap-2.5">
        <Skeleton className="h-13" />
        <Skeleton className="h-13" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {[0, 1, 2].map((item) => (
          <Skeleton key={item} className="h-26" />
        ))}
      </div>
    </div>
  );
}

function PodPhotosPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [inspection, setInspection] = useState(null);
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'error' | 'success'
  const [loadError, setLoadError] = useState(null);
  const [reloadCount, setReloadCount] = useState(0);

  // Photos being compressed/uploaded right now: [{ key, previewUrl, status }].
  const [pending, setPending] = useState([]);
  const [removingId, setRemovingId] = useState(null);
  // Messages about the last add/remove (rejected files, skipped files, upload errors).
  const [notices, setNotices] = useState([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [analyseError, setAnalyseError] = useState(null);

  useEffect(() => {
    let ignore = false;

    getInspection(id)
      .then((item) => {
        if (ignore) return;
        setInspection(item);
        setLoadState('success');
      })
      .catch((error) => {
        if (ignore) return;
        setLoadError(error);
        setLoadState('error');
      });

    return () => {
      ignore = true;
    };
  }, [id, reloadCount]);

  function handleRetry() {
    setLoadState('loading');
    setLoadError(null);
    setReloadCount((count) => count + 1);
  }

  const pods = inspection?.pods ?? [];
  const isBusy = pending.length > 0 || removingId !== null || isAnalysing;
  const isFull = pods.length + pending.length >= MAX_POD_PHOTOS;
  const alreadyAnalysed = isAnalysed(inspection);
  const newPodCount = pods.filter((pod) => !pod.aiLabel).length;

  function updatePending(key, changes) {
    setPending((current) =>
      current.map((item) => (item.key === key ? { ...item, ...changes } : item))
    );
  }

  // Runs after the officer takes a photo or picks from the gallery.
  async function handleFilesChosen(event) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = ''; // so picking the same file again still fires onChange
    if (files.length === 0) return;

    const messages = [];
    const validFiles = [];
    for (const file of files) {
      const problem = checkPhotoFile(file);
      if (problem) messages.push(problem);
      else validFiles.push(file);
    }

    // Never go over the maximum: add what fits and say how many were skipped.
    const freeSlots = Math.max(0, MAX_POD_PHOTOS - pods.length - pending.length);
    const toAdd = validFiles.slice(0, freeSlots);
    const skipped = validFiles.length - toAdd.length;
    if (skipped > 0) {
      messages.push(
        `Max ${MAX_POD_PHOTOS} photos per inspection: ${skipped} ${skipped === 1 ? 'photo was' : 'photos were'} skipped.`
      );
    }
    setNotices(messages);
    setAnalyseError(null);
    if (toAdd.length === 0) return;

    const batch = toAdd.map((file, index) => ({
      key: `${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'compressing',
    }));
    setPending((current) => [...current, ...batch]);

    // One photo at a time, so one failed upload does not lose the others.
    for (const item of batch) {
      try {
        const compressed = await imageCompression(item.file, PHOTO_COMPRESSION);
        // Keep the original file name (the compressed result can be a plain Blob).
        const upload = new File([compressed], item.file.name, { type: compressed.type });
        updatePending(item.key, { status: 'uploading' });
        const updated = await addPodPhotos(id, [upload]);
        setInspection(updated);
      } catch (error) {
        const reason = error.userMessage ?? 'Check your internet and try again.';
        setNotices((current) => [...current, `${item.file.name}: could not be added. ${reason}`]);
      } finally {
        URL.revokeObjectURL(item.previewUrl);
        setPending((current) => current.filter((pendingItem) => pendingItem.key !== item.key));
      }
    }
  }

  async function handleRemove(pod, name) {
    setRemovingId(pod.id);
    setNotices([]);
    try {
      const updated = await removePodPhoto(id, pod.id);
      setInspection(updated);
    } catch (error) {
      setNotices([`Could not remove ${name}. ${error.userMessage ?? 'Please try again.'}`]);
    } finally {
      setRemovingId(null);
    }
  }

  async function handleAnalyse() {
    setIsAnalysing(true);
    setAnalyseError(null);
    try {
      await analyseInspection(id);
      navigate(wizardStepPath(id, 3));
    } catch (error) {
      // The photos are already saved in the draft, so the officer can simply try again.
      setAnalyseError(error);
      setIsAnalysing(false);
    }
  }

  // A completed inspection is locked: show its report instead.
  if (inspection?.status === 'completed') {
    return <Navigate to={inspectionPath(id)} replace />;
  }

  const subtitle = inspection && (
    <>
      {inspection.block.name} · <span className="font-mono">{inspection.tree.code}</span> ·{' '}
      {formatShortDate(inspection.visitDate)}
    </>
  );

  let analyseLabel = `Analyse ${pluralPods(pods.length)}`;
  if (isAnalysing) analyseLabel = `Analysing ${pluralPods(newPodCount)}…`;
  else if (pods.length > newPodCount && newPodCount > 0) {
    // Some pods were analysed before; only the new ones are sent to the AI.
    analyseLabel = `Analyse ${newPodCount} new ${newPodCount === 1 ? 'pod' : 'pods'}`;
  }

  const footer =
    loadState === 'success' ? (
      <div className="flex flex-col gap-1.5">
        {analyseError && (
          <ErrorState
            title="Could not analyse the pods"
            error={analyseError}
            onRetry={handleAnalyse}
            className="mb-2"
          />
        )}
        {alreadyAnalysed ? (
          <Button fullWidth onClick={() => navigate(wizardStepPath(id, 3))} disabled={isBusy}>
            Continue to review
          </Button>
        ) : (
          !analyseError && (
            <Button
              fullWidth
              onClick={handleAnalyse}
              loading={isAnalysing}
              disabled={pods.length === 0 || isBusy}
            >
              {analyseLabel}
            </Button>
          )
        )}
        <p className="text-center text-xs text-text-muted">
          {alreadyAnalysed
            ? 'All pods have an AI label. Add photos to analyse more.'
            : 'Needs internet. AI suggests a label for each pod.'}
        </p>
      </div>
    ) : null;

  return (
    // The draft is already saved, so Back goes Home (it is listed under Drafts there).
    <StaffWizardLayout
      step={2}
      subtitle={subtitle}
      onBack={() => navigate('/staff')}
      footer={footer}
    >
      {loadState === 'loading' && <PhotosSkeleton />}

      {loadState === 'error' && (
        <ErrorState
          title="Could not load this inspection"
          error={loadError}
          onRetry={handleRetry}
        />
      )}

      {loadState === 'success' && (
        <div className="space-y-4">
          <Card title="Photo tips">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {PHOTO_TIPS.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </Card>

          {/* The buttons open hidden file inputs. capture="environment" opens the back camera. */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isFull || isBusy}
              className="min-h-13 font-semibold"
            >
              <Camera className="size-5" aria-hidden="true" />
              Take photo
            </Button>
            <Button
              variant="secondary"
              onClick={() => galleryInputRef.current?.click()}
              disabled={isFull || isBusy}
              className="min-h-13 font-semibold"
            >
              <Images className="size-5" aria-hidden="true" />
              From gallery
            </Button>
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilesChosen}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept={ACCEPTED_PHOTO_TYPES.join(',')}
              multiple
              onChange={handleFilesChosen}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>

          {notices.length > 0 && (
            <div
              role="alert"
              className="flex gap-2.5 rounded border border-warning/40 bg-surface p-3 text-sm"
            >
              <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
              <ul className="space-y-1">
                {notices.map((message, index) => (
                  <li key={index}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          <section aria-labelledby="pods-heading">
            <div className="flex items-baseline justify-between">
              <h2 id="pods-heading" className="font-bold">
                Pods added
              </h2>
              <span className="text-sm text-text-muted" aria-live="polite">
                {pods.length} of max {MAX_POD_PHOTOS}
              </span>
            </div>

            {pods.length + pending.length === 0 ? (
              <p className="mt-2 rounded border border-dashed border-border bg-surface p-4 text-center text-sm text-text-muted">
                No photos yet. Add 1 to {MAX_POD_PHOTOS} pod photos, one pod per photo.
              </p>
            ) : (
              <ul className="mt-2.5 grid grid-cols-3 gap-2.5">
                {pods.map((pod, index) => {
                  const name = `Pod ${index + 1}`;
                  return (
                    <PodTile
                      key={pod.id}
                      name={name}
                      photoUrl={pod.photoUrl}
                      overlay={removingId === pod.id ? 'Removing…' : null}
                      onRemove={() => handleRemove(pod, name)}
                      removeDisabled={isBusy}
                    />
                  );
                })}
                {pending.map((item, index) => (
                  <PodTile
                    key={item.key}
                    name={`Pod ${pods.length + index + 1}`}
                    photoUrl={item.previewUrl}
                    overlay={PENDING_LABELS[item.status]}
                  />
                ))}
              </ul>
            )}
          </section>

          <p className="flex items-start gap-2.5 text-sm text-text-muted">
            <Wifi className="mt-0.5 size-4.5 shrink-0" aria-hidden="true" />
            Saved as a draft. No signal? Take photos with your phone camera now, then add them here
            from the gallery later.
          </p>
        </div>
      )}
    </StaffWizardLayout>
  );
}

export default PodPhotosPage;
