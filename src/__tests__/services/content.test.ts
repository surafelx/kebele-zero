// ── API mock ────────────────────────────────────────────────────────────────

const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../services/api', () => ({ __esModule: true, default: mockApi }));

import { aboutAPI, eventsAPI, productsAPI, mediaAPI, radioAPI } from '../../services/content';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Content APIs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── aboutAPI ──────────────────────────────────────────────────────────────

  describe('aboutAPI', () => {
    it('getAbout — calls GET /about', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { sections: [] } });
      await aboutAPI.getAbout();
      expect(mockApi.get).toHaveBeenCalledWith('/about');
    });

    it('getAbout — returns data from response', async () => {
      const data = { title: 'Kebele' };
      mockApi.get.mockResolvedValueOnce({ data });
      const result = await aboutAPI.getAbout();
      expect(result).toEqual(data);
    });

    it('upsertSection — calls PUT /about/:section', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await aboutAPI.upsertSection('hero', { title: 'Welcome' });
      expect(mockApi.put).toHaveBeenCalledWith('/about/hero', { title: 'Welcome' });
    });

    it('upsertSection — returns data from response', async () => {
      const data = { section: 'mission', updated: true };
      mockApi.put.mockResolvedValueOnce({ data });
      const result = await aboutAPI.upsertSection('mission', {});
      expect(result).toEqual(data);
    });
  });

  // ── eventsAPI ─────────────────────────────────────────────────────────────

  describe('eventsAPI', () => {
    it('getEvents — calls GET /events', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await eventsAPI.getEvents();
      expect(mockApi.get).toHaveBeenCalledWith('/events', { params: undefined });
    });

    it('getEvents — passes category param', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await eventsAPI.getEvents({ category: 'Music' });
      expect(mockApi.get).toHaveBeenCalledWith('/events', { params: { category: 'Music' } });
    });

    it('getEvent — calls GET /events/:id', async () => {
      mockApi.get.mockResolvedValueOnce({ data: { id: 'e1' } });
      const result = await eventsAPI.getEvent('e1');
      expect(mockApi.get).toHaveBeenCalledWith('/events/e1');
      expect(result).toMatchObject({ id: 'e1' });
    });

    it('createEvent — calls POST /events', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 'new' } });
      await eventsAPI.createEvent({ title: 'Festival' });
      expect(mockApi.post).toHaveBeenCalledWith('/events', { title: 'Festival' });
    });

    it('updateEvent — calls PUT /events/:id', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await eventsAPI.updateEvent('e1', { title: 'Updated' });
      expect(mockApi.put).toHaveBeenCalledWith('/events/e1', { title: 'Updated' });
    });

    it('deleteEvent — calls DELETE /events/:id', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: {} });
      await eventsAPI.deleteEvent('e1');
      expect(mockApi.delete).toHaveBeenCalledWith('/events/e1');
    });

    it('getCategories — derives categories from events', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [
        { category: 'Music' }, { category: 'Art' }, { category: 'Music' }
      ]});
      const cats = await eventsAPI.getCategories();
      expect(cats).toContain('Music');
      expect(cats).toContain('Art');
      expect(cats.filter((c: string) => c === 'Music').length).toBe(1);
    });
  });

  // ── productsAPI ───────────────────────────────────────────────────────────

  describe('productsAPI', () => {
    it('getProducts — calls GET /products', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await productsAPI.getProducts();
      expect(mockApi.get).toHaveBeenCalledWith('/products', { params: undefined });
    });

    it('getProducts — passes category param', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await productsAPI.getProducts({ category: 'Textiles' });
      expect(mockApi.get).toHaveBeenCalledWith('/products', { params: { category: 'Textiles' } });
    });

    it('createProduct — calls POST /products', async () => {
      mockApi.post.mockResolvedValueOnce({ data: {} });
      await productsAPI.createProduct({ name: 'Scarf' });
      expect(mockApi.post).toHaveBeenCalledWith('/products', { name: 'Scarf' });
    });

    it('updateProduct — calls PUT /products/:id', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await productsAPI.updateProduct('p1', { name: 'Updated' });
      expect(mockApi.put).toHaveBeenCalledWith('/products/p1', { name: 'Updated' });
    });

    it('deleteProduct — calls DELETE /products/:id', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: {} });
      await productsAPI.deleteProduct('p1');
      expect(mockApi.delete).toHaveBeenCalledWith('/products/p1');
    });

    it('getCategories — derives unique categories from products', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [
        { category: 'Textiles' }, { category: 'Food' }, { category: 'Textiles' }
      ]});
      const cats = await productsAPI.getCategories();
      expect(cats).toContain('Textiles');
      expect(cats).toContain('Food');
      expect(cats.filter((c: string) => c === 'Textiles').length).toBe(1);
    });
  });

  // ── mediaAPI ──────────────────────────────────────────────────────────────

  describe('mediaAPI', () => {
    it('getMedia — calls GET /media', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await mediaAPI.getMedia();
      expect(mockApi.get).toHaveBeenCalledWith('/media', { params: undefined });
    });

    it('getMedia — passes category filter', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await mediaAPI.getMedia({ category: 'Culture' });
      expect(mockApi.get).toHaveBeenCalledWith('/media', { params: { category: 'Culture' } });
    });

    it('uploadMedia — calls POST /media', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 'm1' } });
      await mediaAPI.uploadMedia({ title: 'Photo', type: 'image' });
      expect(mockApi.post).toHaveBeenCalledWith('/media', { title: 'Photo', type: 'image' });
    });

    it('deleteMedia — calls DELETE /media/:id', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: {} });
      await mediaAPI.deleteMedia('m1');
      expect(mockApi.delete).toHaveBeenCalledWith('/media/m1');
    });
  });

  // ── radioAPI ──────────────────────────────────────────────────────────────

  describe('radioAPI', () => {
    it('getStations — calls GET /radio', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await radioAPI.getStations();
      expect(mockApi.get).toHaveBeenCalledWith('/radio', { params: undefined });
    });

    it('getStations — passes active filter', async () => {
      mockApi.get.mockResolvedValueOnce({ data: [] });
      await radioAPI.getStations({ active: true });
      expect(mockApi.get).toHaveBeenCalledWith('/radio', { params: { active: true } });
    });

    it('createStation — calls POST /radio', async () => {
      mockApi.post.mockResolvedValueOnce({ data: { id: 's1' } });
      await radioAPI.createStation({ name: 'Jazz FM', streamUrl: 'http://...' });
      expect(mockApi.post).toHaveBeenCalledWith('/radio', { name: 'Jazz FM', streamUrl: 'http://...' });
    });

    it('updateStation — calls PUT /radio/:id', async () => {
      mockApi.put.mockResolvedValueOnce({ data: {} });
      await radioAPI.updateStation('s1', { name: 'Updated' });
      expect(mockApi.put).toHaveBeenCalledWith('/radio/s1', { name: 'Updated' });
    });

    it('deleteStation — calls DELETE /radio/:id', async () => {
      mockApi.delete.mockResolvedValueOnce({ data: {} });
      await radioAPI.deleteStation('s1');
      expect(mockApi.delete).toHaveBeenCalledWith('/radio/s1');
    });
  });
});
