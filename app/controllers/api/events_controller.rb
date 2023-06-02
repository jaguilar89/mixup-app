class Api::EventsController < ApplicationController
  wrap_parameters format: []

  def index
    events = Event.all
    render json: events, scope: @current_user
  end

  def create
    event = @current_user.organized_events.create!(event_params)
    render json: event, scope: @current_user, status: :created
  end

  def show
    event = Event.find_by(id: params[:id])
    render json: event, scope: @current_user
  end

  def destroy
    event = Event.find_by(id: params[:id])
    event.destroy
    render json: { status: ["Event has been canceled"] }
  end

  private

  def event_params
    params.permit(:event_name, :event_location, :event_description, :max_attendees)
  end
end
