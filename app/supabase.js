import { createClient } from '@supabase/supabase-js';

// 환경 변수에서 Supabase 설정 가져오기
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Supabase 클라이언트가 아직 초기화되지 않았다면 초기화
let supabase;

if (!supabase && supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    }
  });
}

// 데이터베이스 타입 정의
/**
 * @typedef {Object} Profile
 * @property {string} id - 사용자 UUID
 * @property {string} username - 사용자 이름
 * @property {string} full_name - 전체 이름
 * @property {string} avatar_url - 프로필 이미지 URL
 * @property {Date} created_at - 생성일
 * @property {Date} updated_at - 수정일
 */

/**
 * @typedef {Object} Meditation
 * @property {string} id - 묵상 UUID
 * @property {string} user_id - 작성자 UUID
 * @property {string} bible_book - 성경 책
 * @property {number} bible_chapter - 성경 장
 * @property {string} bible_verse - 성경 절
 * @property {string} content - 묵상 내용
 * @property {boolean} is_private - 공개/비공개 여부
 * @property {Date} created_at - 작성일
 * @property {Date} updated_at - 수정일
 */

/**
 * @typedef {Object} Tag
 * @property {string} id - 태그 UUID
 * @property {string} name - 태그 이름
 * @property {Date} created_at - 생성일
 */

// 데이터베이스 작업을 위한 유틸리티 함수들
export const database = {
  /**
   * 프로필 관련 함수
   */
  profiles: {
    // 프로필 가져오기
    async get(userId) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },

    // 프로필 업데이트
    async update(userId, updates) {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      return data;
    }
  },

  /**
   * 묵상 관련 함수
   */
  meditations: {
    // 묵상 목록 가져오기
    async list(options = {}) {
      let query = supabase
        .from('meditations')
        .select(`
          *,
          profiles (username, avatar_url),
          meditation_tags (
            tags (id, name)
          )
        `)
        .order('created_at', { ascending: false });

      // 필터 적용
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.isPrivate !== undefined) {
        query = query.eq('is_private', options.isPrivate);
      }
      if (options.tag) {
        query = query.contains('meditation_tags.tags.name', [options.tag]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    // 단일 묵상 가져오기
    async get(id) {
      const { data, error } = await supabase
        .from('meditations')
        .select(`
          *,
          profiles (username, avatar_url),
          meditation_tags (
            tags (id, name)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    // 묵상 생성
    async create(meditation) {
      const { data, error } = await supabase
        .from('meditations')
        .insert([{
          ...meditation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (error) throw error;
      return data[0];
    },

    // 묵상 업데이트
    async update(id, updates) {
      const { data, error } = await supabase
        .from('meditations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data[0];
    },

    // 묵상 삭제
    async delete(id) {
      const { error } = await supabase
        .from('meditations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  /**
   * 태그 관련 함수
   */
  tags: {
    // 전체 태그 목록
    async list() {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },

    // 태그 생성 (없는 경우에만)
    async createIfNotExists(name) {
      const { data: existing } = await supabase
        .from('tags')
        .select('*')
        .eq('name', name)
        .single();

      if (existing) return existing;

      const { data, error } = await supabase
        .from('tags')
        .insert([{ name }])
        .select();
      
      if (error) throw error;
      return data[0];
    }
  },

  /**
   * 묵상-태그 연결 관련 함수
   */
  meditationTags: {
    // 묵상에 태그 추가
    async add(meditationId, tagId) {
      const { error } = await supabase
        .from('meditation_tags')
        .insert([{
          meditation_id: meditationId,
          tag_id: tagId
        }]);
      
      if (error) throw error;
    },

    // 묵상에서 태그 제거
    async remove(meditationId, tagId) {
      const { error } = await supabase
        .from('meditation_tags')
        .delete()
        .eq('meditation_id', meditationId)
        .eq('tag_id', tagId);
      
      if (error) throw error;
    }
  }
};

export { supabase }; 
