import { useState, useEffect, useCallback } from 'react';
import { Modal } from '../shared/Modal';
import { AgistmentResponse, Arena, RoundYard } from '../../types/agistment';
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames';
import { Plus, Trash2, X } from 'lucide-react';
import { ArenaDiagram } from './ArenaDiagram';
import { RoundYardDiagram } from './RoundYardDiagram';
import NumberStepper from '../shared/NumberStepper';
import toast from 'react-hot-toast';

const calculateHash = (obj: unknown): string => {
  return JSON.stringify(obj);
};

interface Props {
  agistment: AgistmentResponse;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAgistment: AgistmentResponse) => void;
}

interface ArenaForm {
  length: number;
  width: number;
  comments: string;
  features: string[];
}

interface RoundYardForm {
  diameter: number;
  comments: string;
}

export const AgistmentRidingFacilitiesModal = ({
  agistment,
  isOpen,
  onClose,
  onUpdate
}: Props) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [editForm, setEditForm] = useState<{
    arenas: Arena[];
    roundYards: RoundYard[];
  }>({
    arenas: [],
    roundYards: []
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialHash, setInitialHash] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [featureInputs, setFeatureInputs] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (isOpen && agistment?.ridingFacilities) {
      const newEditForm = {
        arenas: agistment.ridingFacilities.arenas?.map((arena: Arena) => ({
          length: arena.length || 0,
          width: arena.width || 0,
          comments: arena.comments || '',
          features: arena.features || []
        })) || [],
        roundYards: agistment.ridingFacilities.roundYards?.map((yard: RoundYard) => ({
          diameter: yard.diameter || 0,
          comments: yard.comments || ''
        })) || []
      };
      setEditForm(newEditForm);
      setInitialHash(calculateHash(newEditForm));
      setIsDirty(false);
      setSelectedTab(0);
    }
  }, [isOpen, agistment]);

  useEffect(() => {
    const currentHash = calculateHash(editForm);
    setIsDirty(currentHash !== initialHash);
  }, [editForm, initialHash]);

  const handleUpdateFacilities = useCallback(async () => {
    if (!isDirty || !onUpdate) return;

    setIsSaving(true);
    try {
      await onUpdate({
        ...agistment,
        ridingFacilities: {
          arenas: editForm.arenas,
          roundYards: editForm.roundYards
        }
      });
      onClose();
    } catch (error) {
      console.error('Failed to update riding facilities:', error);
      toast.error('Failed to update riding facilities');
    } finally {
      setIsSaving(false);
    }
  }, [editForm, isDirty, onClose, onUpdate, agistment]);

  const addArena = () => {
    setEditForm(prev => ({
      ...prev,
      arenas: [...prev.arenas, { length: 40, width: 20, comments: '', features: [] }]
    }));
    setIsDirty(true);
  };

  const updateArena = (index: number, updates: Partial<ArenaForm>) => {
    setEditForm(prev => ({
      ...prev,
      arenas: prev.arenas.map((arena, i) => i === index ? { ...arena, ...updates } : arena)
    }));
    setIsDirty(true);
  };

  const removeArena = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      arenas: prev.arenas.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const addRoundYard = () => {
    setEditForm(prev => ({
      ...prev,
      roundYards: [...prev.roundYards, { diameter: 15, comments: '' }]
    }));
    setIsDirty(true);
  };

  const updateRoundYard = (index: number, updates: Partial<RoundYardForm>) => {
    setEditForm(prev => ({
      ...prev,
      roundYards: prev.roundYards.map((yard, i) => i === index ? { ...yard, ...updates } : yard)
    }));
    setIsDirty(true);
  };

  const removeRoundYard = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      roundYards: prev.roundYards.filter((_, i) => i !== index)
    }));
    setIsDirty(true);
  };

  const handleAddFeature = (arenaIndex: number, feature: string) => {
    if (!feature.trim()) return;

    setEditForm(prev => {
      const newArenas = [...prev.arenas];
      newArenas[arenaIndex] = {
        ...newArenas[arenaIndex],
        features: [...newArenas[arenaIndex].features, feature.trim()]
      };
      return { ...prev, arenas: newArenas };
    });
    setIsDirty(true);
  };

  const handleRemoveFeature = (arenaIndex: number, featureIndex: number) => {
    setEditForm(prev => {
      const newArenas = [...prev.arenas];
      newArenas[arenaIndex] = {
        ...newArenas[arenaIndex],
        features: newArenas[arenaIndex].features.filter((_, index) => index !== featureIndex)
      };
      return { ...prev, arenas: newArenas };
    });
    setIsDirty(true);
  };

  const handleFeatureInputChange = (index: number, value: string) => {
    setFeatureInputs(prev => ({ ...prev, [index]: value }));
  };

  const handleAddFeatureForArena = (index: number) => {
    const value = featureInputs[index]?.trim() || '';
    if (value) {
      handleAddFeature(index, value);
      setFeatureInputs(prev => ({ ...prev, [index]: '' }));
    }
  };

  const tabs = ['Arenas', 'Round Yards'];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${tabs[selectedTab]}`}
      size="lg"
      actionIconType="SAVE"
      onAction={handleUpdateFacilities}
      isUpdating={isSaving}
      disableAction={!isDirty}
    >
      <div className="h-[800px] overflow-y-auto">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="sticky top-0 z-20 bg-white">
            <Tab.List className="flex space-x-1 rounded-xl bg-neutral-100 p-1">
              {tabs.map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    classNames(
                      'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                      'ring-white/60 ring-offset-2 ring-offset-neutral-400 focus:outline-none focus:ring-2',
                      selected
                        ? 'bg-white shadow text-neutral-900'
                        : 'text-neutral-700 hover:bg-white/[0.12] hover:text-neutral-900'
                    )
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <div>
            <Tab.Panels>
              <Tab.Panel>
                <div className="space-y-4">
                  <div className="space-y-4">
                    {editForm.arenas.map((arena, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg mb-4">
                        <div className="flex justify-between items-start p-4 border-b border-neutral-200">
                          <h3 className="text-lg font-medium">Arena {index + 1}</h3>
                          <button
                            onClick={() => removeArena(index)}
                            className="button-toolbar inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="flex flex-col sm:flex-row justify-center gap-8">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                                Length (m)
                              </label>
                              <NumberStepper
                                value={arena.length}
                                onChange={(value) => updateArena(index, { length: value })}
                                min={0}
                                max={999}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1 text-center">
                                Width (m)
                              </label>
                              <NumberStepper
                                value={arena.width}
                                onChange={(value) => updateArena(index, { width: value })}
                                min={0}
                                max={999}
                              />
                            </div>
                          </div>
                          <div className="flex justify-center items-center h-[200px]">
                            <ArenaDiagram length={arena.length} width={arena.width} />
                          </div>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Comments
                              </label>
                              <input
                                type="text"
                                className="form-input form-input-compact"
                                value={arena.comments}
                                onChange={(e) => updateArena(index, { comments: e.target.value })}
                                placeholder="Add any additional information..."
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-neutral-700 mb-1">
                                Features
                              </label>
                              <div className="space-y-2">
                                <div className="flex gap-2 items-center">
                                  <input
                                    type="text"
                                    className="form-input form-input-compact"
                                    placeholder="Add a feature (e.g., Mirrors, Spotlights)"
                                    value={featureInputs[index] || ''}
                                    onChange={(e) => handleFeatureInputChange(index, e.target.value)}
                                    onKeyPress={(e) => {
                                      if (e.key === 'Enter' && featureInputs[index]?.trim()) {
                                        handleAddFeatureForArena(index);
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleAddFeatureForArena(index)}
                                    disabled={!featureInputs[index]?.trim()}
                                    className="button-toolbar inline-flex items-center justify-center px-3 py-1.5 border text-sm font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {arena.features.map((feature, featureIndex) => (
                                    <div
                                      key={featureIndex}
                                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                                    >
                                      {feature}
                                      <button
                                        onClick={() => handleRemoveFeature(index, featureIndex)}
                                        className="ml-2 p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addArena}
                    className="w-full flex items-center justify-center px-4 py-3 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    Add Arena
                  </button>
                </div>
              </Tab.Panel>
              <Tab.Panel>
                <div className="space-y-4">
                  <div className="space-y-4">
                    {editForm.roundYards.map((yard, index) => (
                      <div key={index} className="border border-neutral-200 rounded-lg mb-4">
                        <div className="flex justify-between items-start p-4 border-b border-neutral-200">
                          <h3 className="text-lg font-medium">Round Yard {index + 1}</h3>
                          <button
                            onClick={() => removeRoundYard(index)}
                            className="button-toolbar inline-flex items-center px-2.5 py-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex justify-center items-center h-[200px]">
                              <RoundYardDiagram diameter={yard.diameter} />
                            </div>
                            <div>
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                  Diameter (m)
                                </label>
                                <NumberStepper
                                  value={yard.diameter}
                                  onChange={(value) => updateRoundYard(index, { diameter: value })}
                                  min={0}
                                  max={999}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                  Comments
                                </label>
                                <input
                                  type="text"
                                  className="form-input form-input-compact"
                                  value={yard.comments}
                                  onChange={(e) => updateRoundYard(index, { comments: e.target.value })}
                                  placeholder="Add any additional information..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addRoundYard}
                    className="w-full flex items-center justify-center px-4 py-3 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50"
                  >
                    Add Round Yard
                  </button>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </Tab.Group>
      </div>
    </Modal>
  );
};
