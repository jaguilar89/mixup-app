class Api::EventsController < ApplicationController
  wrap_parameters format: []

  def index
    events = Event.all
    render json: events, status: :ok
  end

  def create
    event = Event.create!(event_params)
    render json: event, status: :created
  end

  private

  def event_params
    params.permit(:event_name, :event_location, :event_description, :available_spots)
  end
end
